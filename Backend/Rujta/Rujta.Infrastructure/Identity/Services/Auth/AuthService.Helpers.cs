using Microsoft.AspNetCore.Http;

namespace Rujta.Infrastructure.Identity.Services.Auth
{
    public partial class AuthService
    {
        static private string GenerateSecurePassword()
        {
            const string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string lower = "abcdefghijklmnopqrstuvwxyz";
            const string digits = "0123456789";
            const string symbols = "!@#$%^&*()-_=+";
            char[] password = new char[12];
            using var rng = RandomNumberGenerator.Create();

            // Ensure one of each type
            password[0] = upper[GetRandomIndex(upper.Length, rng)];
            password[1] = lower[GetRandomIndex(lower.Length, rng)];
            password[2] = digits[GetRandomIndex(digits.Length, rng)];
            password[3] = symbols[GetRandomIndex(symbols.Length, rng)];

            string allChars = upper + lower + digits + symbols;
            for (int i = 4; i < password.Length; i++)
            {
                password[i] = allChars[GetRandomIndex(allChars.Length, rng)];
            }

            for (int i = password.Length - 1; i > 0; i--)
            {
                int j = GetRandomIndex(i + 1, rng);
                (password[i], password[j]) = (password[j], password[i]);
            }

            return new string(password);
        }

        private static int GetRandomIndex(int max, RandomNumberGenerator rng)
        {
            byte[] bytes = new byte[4];
            rng.GetBytes(bytes);
            return (int)(BitConverter.ToUInt32(bytes, 0) % max);
        }

        private void SetRefreshTokenCookie(string? refreshToken)
        {
            var context = _infra.HttpContextAccessor.HttpContext;
            if (context == null || string.IsNullOrEmpty(refreshToken)) return;

            int expirationDays = int.TryParse(_infra.Configuration[$"JWT:{TokenKeys.RefreshTokenExpirationDays}"], out var days) ? days : 30;
            context.Response.Cookies.Append(CookieKeys.RefreshToken, refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(expirationDays)
            });
        }
    }
}
