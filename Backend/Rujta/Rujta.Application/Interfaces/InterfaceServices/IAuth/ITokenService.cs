using Microsoft.IdentityModel.Tokens;

namespace Rujta.Application.Interfaces.InterfaceServices.IAuth
{
    public interface ITokenService
    {
        Task<string> GenerateAccessTokenAsync(ApplicationUserDto userDto, string? jwtId = null);

        Task<string> GenerateRefreshTokenAsync(ApplicationUserDto userDto, string deviceId, bool rememberMe = false);

        Task<RefreshToken?> VerifyRefreshTokenAsync(ApplicationUserDto userDto, string providedToken);

        Task<(string Token, string Jti, DateTime Expiration)> GenerateAccessTokenFromRefreshTokenAsync(
            string rawRefreshToken,
            ApplicationUserDto userDto,
            string deviceId
        );
    }
}