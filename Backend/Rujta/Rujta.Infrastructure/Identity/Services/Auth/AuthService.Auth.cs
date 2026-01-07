using Microsoft.AspNetCore.Http;

namespace Rujta.Infrastructure.Identity.Services.Auth
{
    public partial class AuthService
    {
        public async Task<bool> CheckPasswordAsync(string email, string password, CancellationToken cancellationToken = default)
        {
            var user = await _identity.Identity.UserManager.FindByEmailAsync(email);
            if (user == null)
            {
                _infra.Logger.LogWarning("Password check failed: user not found ({Email})", email);
                return false;
            }

            var result = await _identity.Identity.SignInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);
            _infra.Logger.LogInformation("Password check for {Email}: {Result}", email, result.Succeeded ? "Succeeded" : "Failed");
            return result.Succeeded;
        }

        public async Task<TokenDto> GenerateTokensAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _identity.Identity.UserManager.FindByEmailAsync(email);
            if (user == null)
            {
                _infra.Logger.LogWarning("Token generation failed: user not found ({Email})", email);
                throw new InvalidOperationException(AuthMessages.UserNotFound);
            }

            ApplicationUserDto userDto = _identity.Mapper.Map<ApplicationUserDto>(user);
            var context = _infra.HttpContextAccessor.HttpContext!;
            string? deviceId = context.Request.Cookies.TryGetValue(CookieKeys.DeviceId, out var id) ? id : null;

            if (deviceId == null)
            {
                deviceId = Guid.NewGuid().ToString();
                context.Response.Cookies.Append(CookieKeys.DeviceId, deviceId, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddYears(1)
                });

                var device = new Device
                {
                    DeviceId = deviceId,
                    UserId = user.DomainPersonId,
                    DeviceName = DeviceHelper.GetDeviceInfo(context),
                    IPAddress = context.Connection.RemoteIpAddress?.MapToIPv4().ToString()
                };

                await _identity.UnitOfWork.Devices.AddAsync(device);
                await _identity.UnitOfWork.SaveAsync();
                userDto.DeviceId = deviceId;

                _infra.Logger.LogInformation("New device registered: {DeviceId} for user {Email}", deviceId, email);
            }

            bool loginOrRegister = true;
            var tokens = await _tokenHelper.GenerateTokenPairAsync(userDto, deviceId, loginOrRegister);

            SetRefreshTokenCookie(tokens.RefreshToken);

            _infra.Logger.LogInformation("Tokens generated for user {Email}", email);
            return tokens;
        }

        public async Task<TokenDto> RefreshAccessTokenAsync(string? refreshToken, CancellationToken cancellationToken = default)
        {
            var context = _infra.HttpContextAccessor.HttpContext!;
            refreshToken ??= context.Request.Cookies[CookieKeys.RefreshToken];

            if (string.IsNullOrEmpty(refreshToken))
            {
                _infra.Logger.LogWarning("Refresh token required but missing.");
                throw new InvalidOperationException(AuthMessages.RefreshTokenRequired);
            }

            var storedToken = await RefreshTokenHelper.GetValidRefreshTokenAsync(_identity.UnitOfWork.RefreshTokens, refreshToken);
            if (storedToken == null)
            {
                _infra.Logger.LogWarning("Invalid or expired refresh token.");
                throw new InvalidOperationException(AuthMessages.InvalidOrExpiredRefreshToken);
            }

            var user = await _identity.Identity.UserManager.FindByIdAsync(storedToken.UserId.ToString());
            if (user == null)
            {
                _infra.Logger.LogWarning("User not found during token refresh. UserId: {UserId}", storedToken.UserId);
                throw new InvalidOperationException(AuthMessages.UserNotFound);
            }

            if (string.IsNullOrWhiteSpace(storedToken.DeviceInfo))
            {
                _infra.Logger.LogWarning(
                    "Refresh token without device info. TokenId: {TokenId}", storedToken.Id);

                throw new InvalidOperationException(AuthMessages.InvalidOrExpiredRefreshToken);
            }

            ApplicationUserDto userDto = _identity.Mapper.Map<ApplicationUserDto>(user);
            bool loginOrRegister = false;
            var tokens = await _tokenHelper.GenerateTokenPairAsync(userDto, storedToken.DeviceInfo, loginOrRegister, refreshToken);

            storedToken.Revoked = true;
            storedToken.RevokedAt = DateTime.UtcNow;
            await _identity.UnitOfWork.SaveAsync(); 

            SetRefreshTokenCookie(tokens.RefreshToken);

            _infra.Logger.LogInformation("Access token refreshed for user {Email} and old refresh token revoked.", user.Email);
            return tokens;
        }

        public async Task LogoutAsync(Guid userId, string? refreshToken = null)
        {
            var context = _infra.HttpContextAccessor.HttpContext;
            string? deviceId = context?.Request.Cookies[CookieKeys.DeviceId];

            if (!string.IsNullOrEmpty(refreshToken))
            {
                var token = await RefreshTokenHelper.GetValidRefreshTokenAsync(_identity.UnitOfWork.RefreshTokens, refreshToken);
                if (token != null && token.UserId == userId)
                {
                    token.Revoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                    await _identity.UnitOfWork.SaveAsync();
                    _infra.Logger.LogInformation("User {UserId} logged out using refresh token.", userId);
                }
            }
            else if (!string.IsNullOrEmpty(deviceId))
            {
                var tokens = await _identity.UnitOfWork.RefreshTokens.GetAllByDeviceIdAsync(userId, deviceId);
                foreach (var token in tokens)
                {
                    token.Revoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                }
                await _identity.UnitOfWork.SaveAsync();
                _infra.Logger.LogInformation("User {UserId} logged out on device {DeviceId}.", userId, deviceId);
            }
            else
            {
                await _tokenHelper.RevokeOldRefreshTokensAsync(userId);
                _infra.Logger.LogInformation("User {UserId} logged out from all devices.", userId);
            }
        }
    }
}