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

        public async Task<TokenDto> GenerateTokenPairAsync(ApplicationUserDto userDto, string deviceId)
        {
            await RevokeOldRefreshTokensAsync(userDto.Id);

            var refreshToken = await _tokenService.GenerateRefreshTokenAsync(userDto, deviceId);
            var (accessToken, accessTokenJti, accessTokenExpiration) = await _tokenService.GenerateAccessTokenFromRefreshTokenAsync(refreshToken, userDto, deviceId);

            var refreshTokenExpiration = DateTime.UtcNow.AddDays(
                double.TryParse(_configuration["JWT:RefreshTokenExpirationDays"], out var days) ? days : 30
            );

            return new TokenDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                RefreshTokenExpiration = refreshTokenExpiration,
                AccessTokenExpiration = accessTokenExpiration,
                AccessTokenJti = accessTokenJti
            };
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
    }
}
