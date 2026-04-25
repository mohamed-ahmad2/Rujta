using Rujta.Application.DTOs.AuthDto;

namespace Rujta.Infrastructure.Identity.Helpers
{
    public class TokenHelper
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly TokenService _tokenService;
        private readonly IConfiguration _configuration;

        public TokenHelper(
            IUnitOfWork unitOfWork,
            TokenService tokenService,
            IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        public async Task<TokenDto> GenerateTokenPairAsync(ApplicationUserDto userDto,string deviceId, bool loginOrRegister,bool rememberMe = false,string? rawRefreshToken = null)
        {
            if (loginOrRegister)
            {
                var refreshToken = await _tokenService.GenerateRefreshTokenAsync(userDto, deviceId, rememberMe);

                var accessToken = await _tokenService.GenerateAccessTokenAsync(userDto);

                var refreshTokenExpiration = GetRefreshTokenExpiration(rememberMe);
                var accessTokenExpiration = DateTime.UtcNow.AddMinutes(
                    double.TryParse(
                        _configuration["JWT:AccessTokenExpirationMinutes"],
                        out var aMins) ? aMins : 10
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
                    throw new ArgumentException( "Refresh token data required.", nameof(rawRefreshToken));

                var (accessToken, accessTokenJti, accessTokenExpiration) =
                    await _tokenService.GenerateAccessTokenFromRefreshTokenAsync(
                        rawRefreshToken, userDto, deviceId);

                await RevokeOldRefreshTokensExceptAsync(userDto.Id, rawRefreshToken);

                var newRefreshToken = await _tokenService.GenerateRefreshTokenAsync(
                    userDto, deviceId, rememberMe);

                var refreshTokenExpiration = GetRefreshTokenExpiration(rememberMe);

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

        private DateTime GetRefreshTokenExpiration(bool rememberMe)
        {
            if (rememberMe)
            {
                var longDays = double.TryParse(
                    _configuration["JWT:RefreshTokenExpirationDays"], out var d) ? d : 30;
                return DateTime.UtcNow.AddDays(longDays);
            }
            else
            {
                var shortDays = double.TryParse(
                    _configuration["JWT:ShortRefreshTokenExpirationDays"], out var d) ? d : 1;
                return DateTime.UtcNow.AddDays(shortDays);
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

        public async Task RevokeOldRefreshTokensExceptAsync(Guid userId, string exceptRawToken)
        {
            using var sha256 = SHA256.Create();
            var hashedExceptToken = Convert.ToBase64String(
                sha256.ComputeHash(Encoding.UTF8.GetBytes(exceptRawToken)));

            var tokens = await _unitOfWork.RefreshTokens.GetAllValidTokensByUserIdAsync(userId);
            foreach (var token in tokens)
            {
                if (token.Token == hashedExceptToken) continue;

                token.Revoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }
            await _unitOfWork.SaveAsync();
        }
    }
}