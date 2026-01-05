using Rujta.Infrastructure.Identity.Services;
namespace Rujta.Infrastructure.Identity.Helpers
{
    public class TokenHelper
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _configuration;
        public TokenHelper(IUnitOfWork unitOfWork, TokenService tokenService, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
            _configuration = configuration;
        }
        public async Task<TokenDto> GenerateTokenPairAsync(ApplicationUserDto userDto, string deviceId, bool loginOrRegister, string? rawRefreshToken = null)
        {
            if (loginOrRegister)
            {
                var refreshToken = await _tokenService.GenerateRefreshTokenAsync(userDto, deviceId);
                var accessToken = await _tokenService.GenerateAccessTokenAsync(userDto);
                var refreshTokenExpiration = DateTime.UtcNow.AddDays(
                double.TryParse(_configuration["JWT:RefreshTokenExpirationDays"], out var days) ? days : 30
                );
                var accessTokenExpiration = DateTime.UtcNow.AddMinutes(
                double.TryParse(_configuration["JWT:AccessTokenExpirationMinutes"], out var aMins) ? aMins : 10
                );
                return new TokenDto
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    RefreshTokenExpiration = refreshTokenExpiration,
                    AccessTokenExpiration = accessTokenExpiration,
                };
            }
            else
            {
                if (string.IsNullOrWhiteSpace(rawRefreshToken))
                    throw new ArgumentException("Refresh token data required.", nameof(rawRefreshToken));
                var (accessToken, accessTokenJti, accessTokenExpiration) = await _tokenService.GenerateAccessTokenFromRefreshTokenAsync(rawRefreshToken, userDto, deviceId);
                await RevokeOldRefreshTokensExceptAsync(userDto.Id, rawRefreshToken);
                var refreshTokenExpiration = DateTime.UtcNow.AddDays(
                double.TryParse(_configuration["JWT:RefreshTokenExpirationDays"], out var days) ? days : 30
                );
                var newRefreshToken = await _tokenService.GenerateRefreshTokenAsync(userDto, deviceId);
                return new TokenDto
                {
                    AccessToken = accessToken,
                    RefreshToken = newRefreshToken,
                    RefreshTokenExpiration = refreshTokenExpiration,
                    AccessTokenExpiration = accessTokenExpiration,
                    AccessTokenJti = accessTokenJti
                };
            }
        }
        public async Task RevokeOldRefreshTokensAsync(Guid userId)
        {
            var tokens = await _unitOfWork.RefreshTokens.GetAllValidTokensByUserIdAsync(userId);
            foreach (var token in tokens)
            {
                token.Revoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }
            await _unitOfWork.SaveAsync();
        }
        public async Task RevokeOldRefreshTokensExceptAsync(Guid userId, string exceptToken)
        {
            using var sha256 = SHA256.Create();
            var hashedExcept = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(exceptToken)));
            var tokens = await _unitOfWork.RefreshTokens.GetAllValidTokensByUserIdAsync(userId);
            foreach (var token in tokens)
            {
                if (token.Token == hashedExcept) continue;
                token.Revoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }
            await _unitOfWork.SaveAsync();
        }
    }
}