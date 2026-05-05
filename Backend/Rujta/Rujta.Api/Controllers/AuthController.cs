using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Rujta.Application.DTOs.AuthDto;
using Rujta.Application.Interfaces.InterfaceServices.IAuth;
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
        private readonly IServiceScopeFactory _scopeFactory;

        public AuthController(IAuthService authService, IServiceScopeFactory scopeFactory)
        {
            _authService = authService;
            _scopeFactory = scopeFactory;
        }

        private void FireAndForgetLog(string user, string action)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var logService = scope.ServiceProvider
                                               .GetRequiredService<ILogService>();
                    await logService.AddLogAsync(user, action);
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(
                        $"[FireAndForgetLog] Failed to log: {ex.Message}");
                }
            });
        }

        [HttpPost("login")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);

                FireAndForgetLog(dto.Email, LogConstants.UserLoggedIn);

                return Ok(new
                {
                    Email = dto.Email,
                    Role = result.Role,
                    AccessToken = result.AccessToken,
                    IsFirstLogin = result.IsFirstLogin
                });
            }
            catch (UnauthorizedAccessException)
            {
                FireAndForgetLog(dto.Email, LogConstants.FailedLogin);
                return Unauthorized(new { message = "Invalid email or password." });
            }
            catch (InvalidOperationException ex)
            {
                FireAndForgetLog(dto.Email, $"Login error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpPost("register")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var result = await _authService.RegisterAsync(dto);

                FireAndForgetLog(dto.Email, LogConstants.NewUserRegistered);

                return CreatedAtAction(
                    nameof(Login),
                    new { email = dto.Email },
                    new
                    {
                        Role = result.Role,
                        Email = dto.Email,
                        AccessToken = result.AccessToken
                    });
            }
            catch (InvalidOperationException ex)
            {
                FireAndForgetLog(dto.Email, $"Registration error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register/admin")]
        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)}")]
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

                FireAndForgetLog(
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
                FireAndForgetLog(
                    dto?.Email ?? LogConstants.UnknownUser,
                    $"Registration error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)}")]
        [HttpPost("register/staff")]
        public async Task<IActionResult> RegisterStaff([FromBody] RegisterByAdminDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request data." });

            UserRole roleToAssign;

            if (User.IsInRole(nameof(UserRole.PharmacyAdmin)))
            {
                roleToAssign = UserRole.Pharmacist;

                var pharmacyIdClaim = User.FindFirst("PharmacyId");
                if (pharmacyIdClaim == null)
                    return Unauthorized("Pharmacy context missing.");

                dto.PharmacyId = int.Parse(pharmacyIdClaim.Value);
            }
            else
            {
                roleToAssign = dto.Role ?? UserRole.User;
            }

            var userId = await _authService.CreateUserAsync(dto, roleToAssign);

            return Ok(new
            {
                UserId = userId,
                Email = dto.Email,
                Role = roleToAssign.ToString(),
                PharmacyId = dto.PharmacyId
            });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var refreshToken = Request.Cookies[CookieKeys.RefreshToken];
                if (string.IsNullOrEmpty(refreshToken))
                {
                    FireAndForgetLog(
                        LogConstants.UnknownUser,
                        LogConstants.RefreshTokenNotExist);
                    return BadRequest(new { message = AuthMessages.RefreshTokenNotExist });
                }

                var tokens = await _authService.RefreshAccessTokenAsync(refreshToken);
                FireAndForgetLog(
                    LogConstants.UnknownUser,
                    LogConstants.RefreshTokenUsed);

                return Ok(new { AccessToken = tokens.AccessToken });
            }
            catch (InvalidOperationException ex)
            {
                FireAndForgetLog(
                    LogConstants.UnknownUser,
                    $"Refresh token error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (SecurityTokenException ex)
            {
                FireAndForgetLog(
                    LogConstants.UnknownUser,
                    $"Refresh token security error: {ex.Message}");
                return Unauthorized(new { message = "Invalid or expired refresh token." });
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
                    return Unauthorized(new { message = AuthMessages.UserNotFoundInToken });

                if (!Guid.TryParse(userIdClaim, out var userId))
                    return BadRequest(new { message = AuthMessages.InvalidUserIdInToken });

                var refreshToken = Request.Cookies[CookieKeys.RefreshToken];
                if (!string.IsNullOrEmpty(refreshToken))
                {
                    await _authService.LogoutAsync(userId, refreshToken);
                }
                else
                {
                    await _authService.LogoutAsync(userId);
                }

                FireAndForgetLog(userId.ToString(), LogConstants.LogoutMessage);

                Response.Cookies.Delete(CookieKeys.AccessToken);
                Response.Cookies.Delete(CookieKeys.RefreshToken);

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                FireAndForgetLog(
                    User?.Identity?.Name ?? LogConstants.UnknownUser,
                    $"Logout error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(typeof(MeResponse), 200)]
        public IActionResult Me()
        {
            var email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

            var role = User.Claims
                           .Where(c => c.Type == ClaimTypes.Role)
                           .Select(c => c.Value)
                           .FirstOrDefault() ?? string.Empty;

            return Ok(new MeResponse(email, role));
        }

        [Authorize]
        [HttpGet("email")]
        [ProducesResponseType(typeof(EmailResponse), StatusCodes.Status200OK)]
        public IActionResult GetUserEmail()
        {
            var email = User.FindFirstValue(ClaimTypes.Email)
                        ?? User.FindFirstValue(JwtRegisteredClaimNames.Email)
                        ?? string.Empty;

            return Ok(new EmailResponse(email));
        }

        [HttpPost("reset-password")]
        [EnableRateLimiting("LoginPolicy")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                await _authService.ResetPasswordAsync(dto);
                return Ok(new { message = "Password reset successful." });
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

        [HttpPost("change-password")]
        [Authorize(Roles = "PharmacyAdmin")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                var email = User.FindFirstValue(ClaimTypes.Email);

                if (string.IsNullOrWhiteSpace(email))
                    return Unauthorized(new { message = "Invalid token." });

                await _authService.ChangePasswordAsync(email, dto.NewPassword);

                return Ok(new { message = "Password changed successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register-dummy-pharmacyadmin")]
        public async Task<IActionResult> RegisterDummyPharmacyAdmin(
            int pharmacyId, string email, string pass)
        {
            try
            {
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

                FireAndForgetLog(
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
                FireAndForgetLog(
                    LogConstants.UnknownUser,
                    $"Dummy PharmacyAdmin creation error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register-dummy-superadmin")]
        public async Task<IActionResult> RegisterDummySuperAdmin(string email, string pass)
        {
            try
            {
                var dummyDto = new RegisterByAdminDto
                {
                    Email = email,
                    CreatePassword = pass,
                    ConfirmPassword = pass,
                    Name = "Dummy SuperAdmin",
                    Role = UserRole.SuperAdmin,
                };

                var userId = await _authService.CreateUserAsync(dummyDto, UserRole.SuperAdmin);

                FireAndForgetLog(
                    dummyDto.Email,
                    $"Dummy SuperAdmin created for testing. UserId: {userId}");

                return Ok(new
                {
                    UserId = userId,
                    Email = dummyDto.Email,
                    Role = dummyDto.Role.ToString()
                });
            }
            catch (InvalidOperationException ex)
            {
                FireAndForgetLog(
                    LogConstants.UnknownUser,
                    $"Dummy SuperAdmin creation error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        public record MeResponse(string Email, string Role);
        public record EmailResponse(string Email);
    }
}