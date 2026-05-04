using FirebaseAdmin.Auth;
using Rujta.Application.DTOs.AuthDto;

namespace Rujta.Infrastructure.Identity.Services.Auth
{
    public partial class AuthService
    {
        public async Task<TokenDto> LoginWithGoogle(string idToken)
        {

            if (string.IsNullOrWhiteSpace(idToken))
            {
                _infra.Logger.LogWarning("Google login failed: ID token is missing.");
                throw new ArgumentNullException(nameof(idToken), "ID token is required.");
            }

            FirebaseToken decodedToken;
            try
            {
                decodedToken = await FirebaseAuth.DefaultInstance
                                                 .VerifyIdTokenAsync(idToken);
            }
            catch (FirebaseAuthException ex)
            {
                _infra.Logger.LogError(ex, "Invalid Firebase ID token.");
                throw new InvalidOperationException("Invalid Firebase ID token.", ex);
            }
            catch (Exception ex)
            {
                _infra.Logger.LogError(ex, "Error verifying Firebase ID token.");
                throw new InvalidOperationException(
                    "An error occurred while verifying the Firebase ID token.", ex);
            }

            if (!decodedToken.Claims.TryGetValue("email", out var emailObj) ||
                string.IsNullOrWhiteSpace(emailObj?.ToString()))
            {
                _infra.Logger.LogError("Email not found in Firebase token.");
                throw new InvalidOperationException("Email not found in token.");
            }

            string email = emailObj.ToString()!;

            string name = decodedToken.Claims.TryGetValue("name", out var nameObj)
                          && !string.IsNullOrWhiteSpace(nameObj?.ToString())
                ? nameObj.ToString()!
                : email.Split('@')[0];

            var appUser = await _identity.Identity.UserManager
                                         .FindByEmailAsync(email);

            if (appUser == null)
            {
                var registerDto = new RegisterDto
                {
                    Email = email,
                    Name = name,
                    CreatePassword = GenerateSecurePassword()
                };

                await CreateUserAsync(registerDto, UserRole.User);

                appUser = await _identity.Identity.UserManager
                                         .FindByEmailAsync(email)
                          ?? throw new InvalidOperationException(
                                 "Failed to create new user.");

                _infra.Logger.LogInformation(
                    "New user created via Google login: {Email}", email);
            }

            _infra.Logger.LogInformation(
                "User {Email} logged in with Google.", email);

            return await GenerateTokensForUserAsync(
                appUser,
                rememberMe: false);
        }
    }
}