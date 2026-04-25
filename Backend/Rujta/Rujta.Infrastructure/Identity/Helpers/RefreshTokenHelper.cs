namespace Rujta.Infrastructure.Identity.Helpers
{
    public static class RefreshTokenHelper
    {
        public static async Task<RefreshToken?> GetValidRefreshTokenAsync(IRefreshTokenRepository refreshTokenRepo,string rawRefreshToken)
        {
            if (string.IsNullOrWhiteSpace(rawRefreshToken))
                return null;

            using var sha256 = SHA256.Create();
            var hashedToken = Convert.ToBase64String(
                sha256.ComputeHash(Encoding.UTF8.GetBytes(rawRefreshToken)));

            var storedToken = await refreshTokenRepo.GetByTokenAsync(hashedToken);

            if (storedToken == null)
                return null;

            if (storedToken.Revoked)
                return null;

            if (storedToken.Expiration < DateTime.UtcNow)
                return null;

            return storedToken;
        }
    }
}