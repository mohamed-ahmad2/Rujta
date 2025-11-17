using Microsoft.AspNetCore.Authorization;
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
    }
}
