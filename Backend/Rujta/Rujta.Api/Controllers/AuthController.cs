using AutoMapper;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Infrastructure.Identity;
using System.IdentityModel.Tokens.Jwt;



namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {

        readonly private IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var passwordValid = await _authService.CheckPasswordAsync(dto.Email, dto.Password);
                if (!passwordValid) return Unauthorized();

                var tokens = await _authService.GenerateTokensAsync(dto.Email);

                return Ok(tokens);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var userId = await _authService.CreateUserAsync(dto, UserRole.User);
                var tokens = await _authService.GenerateTokensAsync(dto.Email);

                return CreatedAtAction(nameof(Login), new { email = dto.Email }, new { UserId = userId, tokens });

            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
        {
            try
            {
                var tokens = await _authService.RefreshAccessTokenAsync(dto.RefreshToken);

                return Ok(tokens);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
                if (userIdClaim == null)
                    return Unauthorized("User not found in token.");

                if (!Guid.TryParse(userIdClaim, out var userId))
                    return BadRequest("Invalid user ID in token.");

                await _authService.LogoutAsync(userId, dto.RefreshToken);

                Response.Cookies.Delete("jwt");

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Ok("If the email exists, a reset link has been sent.");

            var token = Guid.NewGuid().ToString("N");

            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(15);

            await _userManager.UpdateAsync(user);

            // ⛔ TODO: Send email (later)
            // For now just return the link to test:
            return Ok(new
            {
                Message = "Reset link created",
                ResetLink = $"https://your-frontend.com/reset-password?token={token}&email={dto.Email}"
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest("Invalid token or email.");

            if (user.PasswordResetToken != dto.Token ||
                user.PasswordResetTokenExpiry < DateTime.UtcNow)
            {
                return BadRequest("Reset token is invalid or expired.");
            }

            // Remove old password
            var remove = await _userManager.RemovePasswordAsync(user);
            if (!remove.Succeeded)
                return BadRequest("Failed to update password.");

            // Add new password
            var add = await _userManager.AddPasswordAsync(user, dto.NewPassword);
            if (!add.Succeeded)
                return BadRequest(add.Errors);

            // Clear reset token
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            await _userManager.UpdateAsync(user);

            return Ok("Password reset successful.");
        }

        [HttpPost("social-login")]
        public async Task<IActionResult> SocialLogin([FromBody] SocialLoginDto dto)
        {
            ApplicationUser user = null;

            if (!string.IsNullOrEmpty(dto.IdToken))
            {
                // ✅ Google login
                var payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken);

                user = await _userManager.FindByEmailAsync(payload.Email);
                if (user == null)
                {
                    user = new ApplicationUser
                    {
                        UserName = payload.Email,
                        Email = payload.Email,
                        FullName = payload.Name
                    };
                    await _userManager.CreateAsync(user);
                    await _userManager.AddToRoleAsync(user, "User");
                }
            }
            else if (!string.IsNullOrEmpty(dto.AccessToken))
            {
                // ✅ Facebook login
                var client = new HttpClient();
                var fbResponse = await client.GetStringAsync($"https://graph.facebook.com/me?fields=email,name&access_token={dto.AccessToken}");
                var fbData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(fbResponse);

                user = await _userManager.FindByEmailAsync(fbData["email"]);
                if (user == null)
                {
                    user = new ApplicationUser
                    {
                        UserName = fbData["email"],
                        Email = fbData["email"],
                        FullName = fbData["name"]
                    };
                    await _userManager.CreateAsync(user);
                    await _userManager.AddToRoleAsync(user, "User");
                }
            }
            else
            {
                return BadRequest("No token provided");
            }

            // ✅ Generate JWT tokens
            var tokens = await _tokenService.GenerateTokensAsync(user);
            await _userManager.SetAuthenticationTokenAsync(user, "App", "RefreshToken", tokens.RefreshToken);

            return Ok(tokens);
        }

    }
}
