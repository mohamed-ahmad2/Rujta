using Microsoft.AspNetCore.RateLimiting;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;
using System.IdentityModel.Tokens.Jwt;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogService _logService;

        public AuthController(IAuthService authService, ILogService logService)
        {
            _authService = authService;
            _logService = logService;
        }

        [HttpPost("login")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var passwordValid = await _authService.CheckPasswordAsync(dto.Email, dto.Password);
                if (!passwordValid)
                {
                    await _logService.AddLogAsync(dto.Email, LogConstants.FailedLogin);
                    return Unauthorized();
                }

                var token = await _authService.GenerateTokensAsync(dto.Email);
                var user = await _authService.GetUserByEmailAsync(dto.Email);
                var role = user?.Role ?? "User";

                await _logService.AddLogAsync(dto.Email, LogConstants.UserLoggedIn);

                return Ok(new
                {
                    Email = dto.Email,
                    Role = role,
                    AccessToken = token.AccessToken
                });
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync(dto.Email, $"Login error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var userId = await _authService.CreateUserAsync(dto, UserRole.User);
                var token = await _authService.GenerateTokensAsync(dto.Email);
                var user = await _authService.GetUserByEmailAsync(dto.Email);
                var role = user?.Role ?? "User";


                await _logService.AddLogAsync(dto.Email, LogConstants.NewUserRegistered);

                return CreatedAtAction(nameof(Login), new { UserId = userId, Role = role, email = dto.Email, AccessToken = token.AccessToken });
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync(dto.Email, $"Registration error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register/admin")]
        //[Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)}")]
        public async Task<IActionResult> RegisterByAdmin([FromBody] RegisterByAdminDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Invalid request data." });

                var roleToAssign = dto.Role ?? UserRole.User;

                if (!Enum.IsDefined(typeof(UserRole), roleToAssign))
                    return BadRequest(new { message = "Invalid role specified." });

                if (User.IsInRole(nameof(UserRole.PharmacyAdmin)) && roleToAssign != UserRole.Pharmacist)
                    return Forbid("PharmacyAdmin can only create Pharmacist users.");


                var pharmacyIdClaim = User.FindFirst("PharmacyId");

                if (User.IsInRole(nameof(UserRole.PharmacyAdmin)))
                {
                    if (pharmacyIdClaim == null)
                        return Unauthorized("Pharmacy context is missing.");

                    dto.PharmacyId = int.Parse(pharmacyIdClaim.Value);
                }


                var userId = await _authService.CreateUserAsync(dto, roleToAssign);

                await _logService.AddLogAsync(
                    dto.Email,
                    $"New user registered by admin with role {roleToAssign}");

                return Ok(new
                {
                    UserId = userId,
                    Email = dto.Email,
                    Role = roleToAssign.ToString(),
                });
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync(dto?.Email ?? LogConstants.UnknownUser, $"Registration error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpPost("register-dummy-pharmacyadmin")]
        public async Task<IActionResult> RegisterDummyPharmacyAdmin(int pharmacyId, string email, string pass)
        {
            try
            {
                // Dummy data for testing
                var dummyDto = new RegisterByAdminDto
                {
                    Email = email,
                    CreatePassword = pass,
                    ConfirmPassword = pass,
                    Name = "Dummy Pharmacy Admin",
                    Role = UserRole.PharmacyAdmin,
                    Location = "EG",
                    PharmacyId = pharmacyId
                };

                var userId = await _authService.CreateUserAsync(dummyDto, UserRole.PharmacyAdmin);

                await _logService.AddLogAsync(
                    dummyDto.Email,
                    $"Dummy PharmacyAdmin created for testing. UserId: {userId}");

                return Ok(new
                {
                    UserId = userId,
                    Email = dummyDto.Email,
                    Role = dummyDto.Role.ToString(),
                    PharmacyId = dummyDto.PharmacyId
                });
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync(
                      LogConstants.UnknownUser,
                    $"Dummy PharmacyAdmin creation error: {ex.Message}");

                return BadRequest(new { message = ex.Message });
            }
        }




        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var refreshToken = Request.Cookies[CookieKeys.RefreshToken];
                if (refreshToken == null)
                {
                    await _logService.AddLogAsync(LogConstants.UnknownUser, LogConstants.RefreshTokenNotExist);
                    return BadRequest(new { message = AuthMessages.RefreshTokenNotExist });
                }
                var tokens = await _authService.RefreshAccessTokenAsync(refreshToken);

                await _logService.AddLogAsync(LogConstants.UnknownUser, LogConstants.RefreshTokenUsed);

                return Ok(new { AccessToken = tokens.AccessToken });
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync(LogConstants.UnknownUser, $"Refresh token error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized(AuthMessages.UserNotFoundInToken);

                if (!Guid.TryParse(userIdClaim, out var userId))
                    return BadRequest(AuthMessages.InvalidUserIdInToken);

                var refreshToken = Request.Cookies[CookieKeys.RefreshToken];
                if (!string.IsNullOrEmpty(refreshToken))
                {
                    await _authService.LogoutAsync(userId, refreshToken);
                }
                else
                {
                    await _authService.LogoutAsync(userId);
                }

                await _logService.AddLogAsync(userId.ToString(), LogConstants.LogoutMessage);

                Response.Cookies.Delete(CookieKeys.AccessToken);
                Response.Cookies.Delete(CookieKeys.RefreshToken);

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync(User?.Identity?.Name ?? LogConstants.UnknownUser, $"Logout error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(typeof(MeResponse), 200)]
        public IActionResult Me()
        {
            var email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;


            var roles = User.Claims
                            .Where(c => c.Type == ClaimTypes.Role)
                            .Select(c => c.Value)
                            .ToList();

            var role = roles.FirstOrDefault() ?? string.Empty;


            return Ok(new MeResponse(email, role));
        }

        [HttpGet("email")]
        [ProducesResponseType(typeof(EmailResponse), StatusCodes.Status200OK)]
        public IActionResult GetUserEmail()
        {
            var email = JwtRegisteredClaimNames.Email;

            if (string.IsNullOrEmpty(email))
                return Ok(new EmailResponse(string.Empty));

            return Ok(new EmailResponse(email));
        }

        [HttpPost("reset-password")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                await _authService.ResetPasswordAsync(dto);
                return Ok("Password reset successful.");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
        {
            try
            {
                var result = await _authService.ForgotPasswordAsync(dto.Email);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("google-login")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> GoogleLogin([FromBody] SocialLoginDto dto)
        {
            try
            {
                var tokens = await _authService.LoginWithGoogle(dto.IdToken);
                return Ok(tokens);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public record MeResponse(string Email, string Role);
    public record EmailResponse(string Email);
}