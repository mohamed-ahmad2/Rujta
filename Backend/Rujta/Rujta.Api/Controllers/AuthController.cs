using AutoMapper;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Data;
using Rujta.Infrastructure.Identity;
using Rujta.Infrastructure.Identity.Services;
using System.Globalization;



namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class AuthController : ControllerBase
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        private readonly TokenService _tokenService;
        private readonly AppDbContext _appDbContext;

        public AuthController(
            AppDbContext appDbContext,
             TokenService tokenService,
            IMapper mapper
            , SignInManager<ApplicationUser> signInManager
            , UserManager<ApplicationUser> userManager
            )
        {
            _appDbContext = appDbContext;
            _tokenService = tokenService;
            _signInManager = signInManager;
            _userManager = userManager;
            _mapper = mapper;
        }

        [HttpGet("ping")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public IActionResult Ping()
        {
            return Ok("Backend is connected!");
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDTO)
        {

            var userExist = await _userManager.FindByEmailAsync(registerDTO.Email);
            if (userExist != null)
                return BadRequest("Email is already registered.");

            var person = _mapper.Map<User>(registerDTO);
            _appDbContext.People.Add(person);
            await _appDbContext.SaveChangesAsync();

            var user = _mapper.Map<ApplicationUser>(registerDTO);

            user.DomainPersonId = person.Id;

            var result = await _userManager.CreateAsync(user, registerDTO.CreatePassword);

            if (!result.Succeeded)
                return BadRequest(result.Errors);


            await _userManager.AddToRoleAsync(user, "User");

            // Auto-login: generate tokens
            var tokens = await _tokenService.GenerateTokensAsync(user);
            await _userManager.SetAuthenticationTokenAsync(user, TokenProviderConstants.AppProvider, TokenKeys.RefreshToken, tokens.RefreshToken);

            return Ok(tokens);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDTO)
        {
            var user = await _userManager.FindByEmailAsync(loginDTO.Email);
            if (user == null) return Unauthorized("Invalid credentials");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDTO.Password, false);
            if (!result.Succeeded) return Unauthorized("Invalid credentials");

            // Generate tokens
            var tokens = await _tokenService.GenerateTokensAsync(user);

            // Store refresh token in Identity table
            await _userManager.SetAuthenticationTokenAsync(user, TokenProviderConstants.AppProvider, TokenKeys.RefreshToken, tokens.RefreshToken);

            return Ok(tokens);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            // Find user by refresh token
            var user = await _userManager.Users.FirstOrDefaultAsync(u =>
                _userManager.GetAuthenticationTokenAsync(u, TokenProviderConstants.AppProvider, TokenKeys.RefreshToken).Result == refreshToken);

            if (user == null) return Unauthorized("Invalid refresh token");

            // Get expiration
            var tokenExpirationStr = await _userManager.GetAuthenticationTokenAsync(user, TokenProviderConstants.AppProvider, TokenKeys.RefreshTokenExpiration);

            if (!DateTime.TryParse(tokenExpirationStr, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var tokenExpiration))
                return Unauthorized("Invalid refresh token expiration");


            if (tokenExpiration < DateTime.UtcNow) return Unauthorized("Refresh token expired");

            // Generate new tokens
            var tokens = await _tokenService.GenerateTokensAsync(user);

            // Rotate refresh token
            await _userManager.SetAuthenticationTokenAsync(
                user,
                TokenProviderConstants.AppProvider,
                TokenKeys.RefreshToken,
                tokens.RefreshToken
                );

            await _userManager.SetAuthenticationTokenAsync(
                 user,
                 TokenProviderConstants.AppProvider,
                 TokenKeys.RefreshTokenExpiration,
                 tokens.RefreshTokenExpiration?.ToString("o")
                );


            return Ok(tokens);
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
