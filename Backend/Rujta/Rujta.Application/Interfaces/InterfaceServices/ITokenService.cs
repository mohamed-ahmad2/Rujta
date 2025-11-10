using Microsoft.IdentityModel.Tokens;
using Rujta.Application.DTOs;
using Rujta.Domain.Entities;


namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface ITokenService
    {
        Task<string> GenerateAccessTokenAsync(ApplicationUserDto userDto, string? jwtId = null);
        Task<string> GenerateRefreshTokenAsync(ApplicationUserDto userDto);
        Task<RefreshToken?> VerifyRefreshTokenAsync(ApplicationUserDto userDto, string providedToken);
        Task<string> GenerateAccessTokenFromRefreshTokenAsync(string rawRefreshToken);
        RsaSecurityKey GetPublicKey();
    }
}
