using FirebaseAdmin.Auth;

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
                decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
            }
            catch (FirebaseAuthException ex)
            {
                _infra.Logger.LogError(ex, "Invalid Firebase ID token.");
                throw new InvalidOperationException("Invalid Firebase ID token.", ex);
            }
            catch (Exception ex)
            {
                _infra.Logger.LogError(ex, "Error verifying Firebase ID token.");
                throw new InvalidOperationException("An error occurred while verifying the Firebase ID token.", ex);
            }

            string email = decodedToken.Claims.TryGetValue("email", out var emailObj)
                            ? emailObj?.ToString() ?? throw new InvalidOperationException("Email not found in token.")
                            : throw new InvalidOperationException("Email not found in token.");
            if (string.IsNullOrWhiteSpace(email))
            {
                _infra.Logger.LogError("Email not found in Firebase token.");
                throw new InvalidOperationException("Email not found in token.");
            }

            string name = decodedToken.Claims.TryGetValue("name", out var nameObj)
                            ? nameObj?.ToString() ?? email.Split('@')[0]
                            : email.Split('@')[0];
            // Check if the user exists using your existing method
            var existingUser = await _identity.UnitOfWork.Users.GetByEmailAsync(email);
            if (existingUser == null)
            {
                string securePassword = GenerateSecurePassword();
                var registerDto = new RegisterDto
                {
                    Email = email,
                    Name = name,
                    CreatePassword = securePassword
                };
                await CreateUserAsync(registerDto, UserRole.User);

                existingUser = await _identity.UnitOfWork.Users.GetByEmailAsync(email);
                if (existingUser == null)
                    throw new InvalidOperationException("Failed to create new user.");
            }


            _infra.Logger.LogInformation("User {Email} logged in with Google.", email);
            return await GenerateTokensAsync(email);
        }
    }
}
