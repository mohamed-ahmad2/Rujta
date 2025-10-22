using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;
using Rujta.Infrastructure.Identity;
using Rujta.Infrastructure.Identity.Services;


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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
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
            await _userManager.SetAuthenticationTokenAsync(user, "RujtaApp", "RefreshToken", tokens.RefreshToken);

            return Ok(tokens);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            var user = await _userManager.FindByEmailAsync(loginDTO.Email);
            if (user == null) return Unauthorized("Invalid credentials");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDTO.Password, false);
            if (!result.Succeeded) return Unauthorized("Invalid credentials");

            // Generate tokens
            var tokens = await _tokenService.GenerateTokensAsync(user);

            // Store refresh token in Identity table
            await _userManager.SetAuthenticationTokenAsync(user, "RujtaApp", "RefreshToken", tokens.RefreshToken);

            return Ok(tokens);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            // Find user by refresh token
            var user = await _userManager.Users.FirstOrDefaultAsync(u =>
                _userManager.GetAuthenticationTokenAsync(u, "RujtaApp", "RefreshToken").Result == refreshToken);

            if (user == null) return Unauthorized("Invalid refresh token");

            // Get expiration
            var tokenExpirationStr = await _userManager.GetAuthenticationTokenAsync(user, "RujtaApp", "RefreshTokenExpiration");

            if (!DateTime.TryParse(tokenExpirationStr, out var tokenExpiration))
                return Unauthorized("Invalid refresh token expiration");

            if (tokenExpiration < DateTime.UtcNow) return Unauthorized("Refresh token expired");

            // Generate new tokens
            var tokens = await _tokenService.GenerateTokensAsync(user);

            // Rotate refresh token
            await _userManager.SetAuthenticationTokenAsync(
                user, 
                "RujtaApp", 
                "RefreshToken", 
                tokens.RefreshToken
                );

            await _userManager.SetAuthenticationTokenAsync(
                 user,
                 "RujtaApp",
                 "RefreshTokenExpiration",
                 tokens.RefreshTokenExpiration?.ToString("o")
                );


            return Ok(tokens);
        }
    }
}
