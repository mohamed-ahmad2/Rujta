using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Identity.Helpers
{
    public static class RefreshTokenHelper
    {
        public static async Task<RefreshToken> GetValidRefreshTokenAsync(IRefreshTokenRepository refreshTokenRepo, string rawRefreshToken)
        {
            if (string.IsNullOrWhiteSpace(rawRefreshToken))
                throw new ArgumentException("Invalid refresh token", nameof(rawRefreshToken));

            using var sha256 = SHA256.Create();
            var hashedToken = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(rawRefreshToken)));

            var storedToken = await refreshTokenRepo.GetByTokenAsync(hashedToken);
            if (storedToken == null || storedToken.Expiration < DateTime.UtcNow)
                throw new SecurityTokenException("Invalid or expired refresh token");

            return storedToken;
        }
    }
}
