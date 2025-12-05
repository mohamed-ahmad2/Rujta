using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Identity;
using System.Security.Cryptography;

namespace Rujta.Infrastructure.Identity.Services
{
    public class AuthService : IAuthService
    {
        private readonly IdentityServices _identityServices;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly TokenHelper _tokenHelper;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly IUserRepository _userRepository;

        public AuthService(
            IdentityServices identityServices,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            ILogger<AuthService> logger,
            IHttpContextAccessor httpContextAccessor,
            TokenHelper tokenHelper,
            IConfiguration configuration,
            IEmailService emailService
            )
        {
            _identityServices = identityServices;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _tokenHelper = tokenHelper;
            _configuration = configuration;
            _emailService = emailService;
        }

        // -----------------------------
        // Standard methods
        // -----------------------------
        public async Task<ApplicationUserDto?> GetUserByEmailAsync(string email)
        {
            _logger.LogInformation("Fetching user by email: {Email}", email);
            return await _unitOfWork.Users.GetByEmailAsync(email);
        }

        public async Task<bool> CheckPasswordAsync(string email, string password, CancellationToken cancellationToken = default)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("Password check failed: user not found ({Email})", email);
                return false;
            }

            var result = await _identityServices.SignInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);
            _logger.LogInformation("Password check for {Email}: {Result}", email, result.Succeeded ? "Succeeded" : "Failed");
            return result.Succeeded;
        }

        public async Task<Guid> CreateUserAsync(RegisterDto dto, UserRole role, CancellationToken cancellationToken = default)
        {
            Person person = role switch
            {
                UserRole.User => _mapper.Map<User>(dto),
                UserRole.Pharmacist => _mapper.Map<Pharmacist>(dto),
                UserRole.Admin => _mapper.Map<Admin>(dto),
                UserRole.Manager => _mapper.Map<Manager>(dto),
                _ => throw new InvalidOperationException(AuthMessages.UnknownRole)
            };

            await _unitOfWork.People.AddAsync(person);
            await _unitOfWork.SaveAsync();

            var user = _mapper.Map<ApplicationUser>(dto);
            user.DomainPersonId = person.Id;

            var result = await _identityServices.UserManager.CreateAsync(user, dto.CreatePassword);
            if (!result.Succeeded)
            {
                string errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("User creation failed for {Email}: {Errors}", dto.Email, errors);
                throw new InvalidOperationException(errors);
            }

            await _identityServices.UserManager.AddToRoleAsync(user, role.ToString());
            _logger.LogInformation("User created successfully: {Email}, Role: {Role}", dto.Email, role);
            return user.Id;
        }

        public async Task<bool> IsEmailExistsAsync(string email, CancellationToken cancellationToken = default)
        {
            var exists = await _identityServices.UserManager.FindByEmailAsync(email) != null;
            _logger.LogInformation("Email check for {Email}: {Exists}", email, exists);
            return exists;
        }

        public async Task<TokenDto> GenerateTokensAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("Token generation failed: user not found ({Email})", email);
                throw new InvalidOperationException(AuthMessages.UserNotFound);
            }

            ApplicationUserDto userDto = _mapper.Map<ApplicationUserDto>(user);
            var context = _httpContextAccessor.HttpContext!;
            string? deviceId = context.Request.Cookies.TryGetValue(CookieKeys.DeviceId, out var id) ? id : null;

            if (deviceId == null)
            {
                deviceId = Guid.NewGuid().ToString();
                context.Response.Cookies.Append(CookieKeys.DeviceId, deviceId, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddYears(1)
                });

                var device = new Device
                {
                    DeviceId = deviceId,
                    UserId = user.DomainPersonId,
                    DeviceName = DeviceHelper.GetDeviceInfo(context),
                    IPAddress = context.Connection.RemoteIpAddress?.MapToIPv4().ToString()
                };

                await _unitOfWork.Devices.AddAsync(device);
                await _unitOfWork.SaveAsync();
                userDto.DeviceId = deviceId;

                _logger.LogInformation("New device registered: {DeviceId} for user {Email}", deviceId, email);
            }

            bool loginOrRegister = true;
            var tokens = await _tokenHelper.GenerateTokenPairAsync(userDto, deviceId, loginOrRegister);

            SetRefreshTokenCookie(tokens.RefreshToken);
            //SetJwtCookie(tokens.AccessToken);

            _logger.LogInformation("Tokens generated for user {Email}", email);
            return tokens;
        }

        public async Task<TokenDto> RefreshAccessTokenAsync(string? providedRefreshToken, CancellationToken cancellationToken = default)
        {
            var context = _httpContextAccessor.HttpContext!;
            providedRefreshToken ??= context.Request.Cookies[CookieKeys.RefreshToken];

            if (string.IsNullOrEmpty(providedRefreshToken))
            {
                _logger.LogWarning("Refresh token required but missing.");
                throw new InvalidOperationException(AuthMessages.RefreshTokenRequired);
            }

            var storedToken = await RefreshTokenHelper.GetValidRefreshTokenAsync(_unitOfWork.RefreshTokens, providedRefreshToken);
            if (storedToken == null)
            {
                _logger.LogWarning("Invalid or expired refresh token.");
                throw new InvalidOperationException(AuthMessages.InvalidOrExpiredRefreshToken);
            }

            var user = await _identityServices.UserManager.FindByIdAsync(storedToken.UserId.ToString());
            if (user == null)
            {
                _logger.LogWarning("User not found during token refresh. UserId: {UserId}", storedToken.UserId);
                throw new InvalidOperationException(AuthMessages.UserNotFound);
            }

            ApplicationUserDto userDto = _mapper.Map<ApplicationUserDto>(user);
            bool loginOrRegister = false;
            var tokens = await _tokenHelper.GenerateTokenPairAsync(userDto, storedToken.DeviceInfo, loginOrRegister, providedRefreshToken);

            SetRefreshTokenCookie(tokens.RefreshToken);
            //SetJwtCookie(tokens.AccessToken);

            _logger.LogInformation("Access token refreshed for user {Email}", user.Email);
            return tokens;
        }

        public async Task LogoutAsync(Guid userId, string? refreshToken = null)
        {
            var context = _httpContextAccessor.HttpContext;
            string? deviceId = context?.Request.Cookies[CookieKeys.DeviceId];

            if (!string.IsNullOrEmpty(refreshToken))
            {
                var token = await RefreshTokenHelper.GetValidRefreshTokenAsync(_unitOfWork.RefreshTokens, refreshToken);
                if (token != null && token.UserId == userId)
                {
                    token.Revoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                    await _unitOfWork.SaveAsync();
                    _logger.LogInformation("User {UserId} logged out using refresh token.", userId);
                }
            }
            else if (!string.IsNullOrEmpty(deviceId))
            {
                var tokens = await _unitOfWork.RefreshTokens.GetAllByDeviceIdAsync(userId, deviceId);
                foreach (var token in tokens)
                {
                    token.Revoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                }
                await _unitOfWork.SaveAsync();
                _logger.LogInformation("User {UserId} logged out on device {DeviceId}.", userId, deviceId);
            }
            else
            {
                await _tokenHelper.RevokeOldRefreshTokensAsync(userId);
                _logger.LogInformation("User {UserId} logged out from all devices.", userId);
            }
        }

        // -----------------------------
        // Forgot password
        // -----------------------------
        public async Task<ForgotPasswordResponseDto> ForgotPasswordAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentNullException(nameof(email));

            var user = await _identityServices.UserManager.FindByEmailAsync(email);
            if (user == null)
            {
                _logger.LogInformation("Forgot password requested for non-existent email: {Email}", email);
                return new ForgotPasswordResponseDto { Message = "If the email exists, an OTP has been sent." };
            }

            string otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            user.PasswordResetToken = otp;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(5);
            await _identityServices.UserManager.UpdateAsync(user);

            string subject = "Your OTP for Password Reset";
            string body = $"<p>Hello {user.FullName},</p><p>Your OTP is: <strong>{otp}</strong></p><p>Expires in 5 minutes.</p>";
            await _emailService.SendEmailAsync(email, subject, body);

            _logger.LogInformation("Forgot password OTP sent to email: {Email}", email);
            return new ForgotPasswordResponseDto { Message = "OTP sent to your email." };
        }

        // -----------------------------
        // Reset password
        // -----------------------------
        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var user = await _identityServices.UserManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                _logger.LogWarning("Reset password failed: user not found ({Email})", dto.Email);
                throw new InvalidOperationException("Invalid OTP or email.");
            }

            if (user.PasswordResetToken != dto.Otp || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            {
                _logger.LogWarning("Reset password failed: invalid or expired OTP for {Email}", dto.Email);
                throw new InvalidOperationException("OTP is invalid or expired.");
            }

            user.PasswordHash = _identityServices.UserManager.PasswordHasher.HashPassword(user, dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _identityServices.UserManager.UpdateAsync(user);
            _logger.LogInformation("Password reset successfully for {Email}", dto.Email);
        }

        // -----------------------------
        // Firebase Google Login
        // -----------------------------
        public async Task<TokenDto> LoginWithGoogle(string idToken)
        {
            if (string.IsNullOrWhiteSpace(idToken))
            {
                _logger.LogWarning("Google login failed: ID token is missing.");
                throw new ArgumentNullException(nameof(idToken), "ID token is required.");
            }

            FirebaseToken decodedToken;
            try
            {
                decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
            }
            catch (FirebaseAuthException ex)
            {
                _logger.LogError(ex, "Invalid Firebase ID token.");
                throw new InvalidOperationException("Invalid Firebase ID token.", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying Firebase ID token.");
                throw new InvalidOperationException("An error occurred while verifying the Firebase ID token.", ex);
            }

            string email = decodedToken.Claims.TryGetValue("email", out var emailObj) ? emailObj?.ToString() : null;
            if (string.IsNullOrWhiteSpace(email))
            {
                _logger.LogError("Email not found in Firebase token.");
                throw new InvalidOperationException("Email not found in token.");
            }

            string name = decodedToken.Claims.TryGetValue("name", out var nameObj) ? nameObj?.ToString() : email.Split('@')[0];

            // Check if the user exists using your existing method
            var existingUser = await _unitOfWork.Users.GetByEmailAsync(email);
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
                _logger.LogInformation("New user created via Google login: {Email}", email);
            }

            _logger.LogInformation("User {Email} logged in with Google.", email);
            return await GenerateTokensAsync(email);
        }



        // -----------------------------
        // Helpers
        // -----------------------------
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

            // Shuffle
            for (int i = password.Length - 1; i > 0; i--)
            {
                int j = GetRandomIndex(i + 1, rng);
                (password[i], password[j]) = (password[j], password[i]);
            }

            return new string(password);
        }

        // Make this static
        private static int GetRandomIndex(int max, RandomNumberGenerator rng)
        {
            byte[] bytes = new byte[4];
            rng.GetBytes(bytes);
            return (int)(BitConverter.ToUInt32(bytes, 0) % max);
        }

        //private void SetJwtCookie(string accessToken)
        //{
        //    var context = _httpContextAccessor.HttpContext;
        //    if (context == null || string.IsNullOrEmpty(accessToken)) return;

        //    int expirationMinutes = int.Parse(_configuration[$"JWT:{TokenKeys.AccessTokenExpirationMinutes}"] ?? "10");
        //    context.Response.Cookies.Append(CookieKeys.AccessToken, accessToken, new CookieOptions
        //    {
        //        HttpOnly = true,
        //        Secure = true,
        //        SameSite = SameSiteMode.None,
        //        Expires = DateTime.UtcNow.AddMinutes(expirationMinutes)
        //    });
        //}

        private void SetRefreshTokenCookie(string? refreshToken)
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null || string.IsNullOrEmpty(refreshToken)) return;

            int expirationDays = int.TryParse(_configuration[$"JWT:{TokenKeys.RefreshTokenExpirationDays}"], out var days) ? days : 30;
            context.Response.Cookies.Append(CookieKeys.RefreshToken, refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(expirationDays)
            });
        }
    }
}
