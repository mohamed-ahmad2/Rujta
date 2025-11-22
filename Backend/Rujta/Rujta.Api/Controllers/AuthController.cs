using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Infrastructure.Identity;
using System.IdentityModel.Tokens.Jwt;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                var passwordValid = await _authService.CheckPasswordAsync(dto.Email, dto.Password);
                if (!passwordValid)
                {
                    await _logService.AddLogAsync(dto.Email, "Failed login attempt");
                    return Unauthorized();
                }

                await _authService.GenerateTokensAsync(dto.Email);
                var user = await _authService.GetUserByEmailAsync(dto.Email);
                var role = user?.Role ?? "User";

                await _logService.AddLogAsync(dto.Email, "User logged in successfully");

                return Ok(new
                {
                    Email = dto.Email,
                    Role = role,
                });
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync(dto.Email, $"Login error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                var userId = await _authService.CreateUserAsync(dto, UserRole.User);
                await _authService.GenerateTokensAsync(dto.Email);
                var user = await _authService.GetUserByEmailAsync(dto.Email);
                var role = user?.Role ?? "User";


                await _logService.AddLogAsync(dto.Email, "New user registered");

                return CreatedAtAction(nameof(Login), new { UserId = userId, Role = role, email = dto.Email });
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync(dto.Email, $"Registration error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var refreshToken = Request.Cookies["refresh_token"];
                if (refreshToken == null)
                {
                    await _logService.AddLogAsync("UnknownUser", "refreshToken not exist in cookies");
                    return BadRequest(new { message = "refreshToken not exist in cookies" });
                }
                var tokens = await _authService.RefreshAccessTokenAsync(refreshToken);

                await _logService.AddLogAsync("UnknownUser", "Refresh token used");

                return Ok(tokens);
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync("UnknownUser", $"Refresh token error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
                if (userIdClaim == null)
                    return Unauthorized("User not found in token.");

                if (!Guid.TryParse(userIdClaim, out var userId))
                    return BadRequest("Invalid user ID in token.");

                var refreshToken = Request.Cookies["refresh_token"];
                if (!string.IsNullOrEmpty(refreshToken))
                {
                    await _authService.LogoutAsync(userId, refreshToken);
                }
                else
                {
                    await _authService.LogoutAsync(userId);
                }

                await _logService.AddLogAsync(userId.ToString(), "User logged out");

                Response.Cookies.Delete("jwt");
                Response.Cookies.Delete("refresh_token");

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync(User?.Identity?.Name ?? "UnknownUser", $"Logout error: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(typeof(MeResponse), 200)]
        public IActionResult Me()
        {
            var email = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Email)?.Value
            ?? string.Empty;

            var roles = User.Claims
                            .Where(c => c.Type == ClaimTypes.Role)
                            .Select(c => c.Value)
                            .ToList();

            var role = roles.FirstOrDefault() ?? string.Empty;

            
            return Ok(new MeResponse(email, role));
        }
    }
    public record MeResponse(string Email, string Role);
}