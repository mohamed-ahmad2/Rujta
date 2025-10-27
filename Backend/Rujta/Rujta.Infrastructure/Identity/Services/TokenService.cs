using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Rujta.Application.DTOs;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Identity.Services
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;

        public TokenService(IConfiguration configuration, UserManager<ApplicationUser> userManager)
        {
            _configuration = configuration;
            _userManager = userManager;
        }

<<<<<<< HEAD
        public async Task<TokenDTO> GenerateTokensAsync(ApplicationUser user)
=======
        public async Task<TokenDto> GenerateTokensAsync(ApplicationUser user)
>>>>>>> origin/main
        {
            //Claims for Access Token
            var email = user.Email ?? throw new InvalidOperationException("User email is null");
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("name", user.FullName ?? "")
            };

            //  Add roles
            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

            // Create Access Token
            var jwtSection = _configuration.GetSection("JWT");
            var signingKey = Environment.GetEnvironmentVariable("JWT_SIGNING_KEY");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey ?? throw new InvalidOperationException("JWT Secret is missing")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var accessTokenExpiration = DateTime.UtcNow.AddMinutes(double.Parse(jwtSection["AccessTokenExpirationMinutes"] ?? "30"));
            var accessToken = new JwtSecurityToken(
                issuer: jwtSection["Issuer"],
                audience: jwtSection["Audience"],
                claims: claims,
                expires: accessTokenExpiration,
                signingCredentials: creds
            );

            //  Create Refresh Token (random string)
            var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            var refreshTokenExpiration = DateTime.UtcNow.AddDays(double.Parse(jwtSection["RefreshTokenExpirationDays"] ?? "7"));

<<<<<<< HEAD
            return new TokenDTO
=======
            return new TokenDto
>>>>>>> origin/main
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(accessToken),
                Expiration = accessTokenExpiration,
                RefreshToken = refreshToken,
                RefreshTokenExpiration = refreshTokenExpiration
            };
        }
    }
}
