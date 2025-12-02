using FirebaseAdmin.Auth;
using Google.Apis.Auth;
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
            IEmailService emailService,
            IUserRepository userRepository)
        {
            _identityServices = identityServices;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _tokenHelper = tokenHelper;
            _configuration = configuration;
            _emailService = emailService;
            _userRepository = userRepository;
        }

        // -----------------------------
        // Standard methods
        // -----------------------------
        public async Task<ApplicationUserDto?> GetUserByEmailAsync(string email)
        {
            return await _unitOfWork.Users.GetByEmailAsync(email);
        }

        public async Task<bool> CheckPasswordAsync(string email, string password, CancellationToken cancellationToken = default)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(email);
            if (user == null) return false;

            var result = await _identityServices.SignInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);
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
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

            await _identityServices.UserManager.AddToRoleAsync(user, role.ToString());
            return user.Id;
        }

        public async Task<bool> IsEmailExistsAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(email);
            return user != null;
        }

        public async Task<TokenDto> GenerateTokensAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(email);
            if (user == null) throw new InvalidOperationException(AuthMessages.UserNotFound);

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
            }

            bool loginOrRegister = true;
            var tokens = await _tokenHelper.GenerateTokenPairAsync(userDto, deviceId, loginOrRegister);

            SetRefreshTokenCookie(tokens.RefreshToken);
            SetJwtCookie(tokens.AccessToken);

            return tokens;
        }

        public async Task<TokenDto> RefreshAccessTokenAsync(string? refreshToken, CancellationToken cancellationToken = default)
        {
            var context = _httpContextAccessor.HttpContext!;
            refreshToken ??= context.Request.Cookies[CookieKeys.RefreshToken];

            if (string.IsNullOrEmpty(refreshToken))
                throw new InvalidOperationException(AuthMessages.RefreshTokenRequired);

            var storedToken = await RefreshTokenHelper.GetValidRefreshTokenAsync(_unitOfWork.RefreshTokens, refreshToken);
            if (storedToken == null) throw new InvalidOperationException(AuthMessages.InvalidOrExpiredRefreshToken);

            var user = await _identityServices.UserManager.FindByIdAsync(storedToken.UserId.ToString());
            if (user == null) throw new InvalidOperationException(AuthMessages.UserNotFound);

            ApplicationUserDto userDto = _mapper.Map<ApplicationUserDto>(user);

            bool loginOrRegister = false;
            var tokens = await _tokenHelper.GenerateTokenPairAsync(userDto, storedToken.DeviceInfo, loginOrRegister, refreshToken);

            SetRefreshTokenCookie(tokens.RefreshToken);
            SetJwtCookie(tokens.AccessToken);

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
            }
            else
            {
                await _tokenHelper.RevokeOldRefreshTokensAsync(userId);
            }
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(dto.Email);
            if (user == null) throw new InvalidOperationException("Invalid OTP or email.");

            if (user.PasswordResetToken != dto.Otp || user.PasswordResetTokenExpiry < DateTime.UtcNow)
                throw new InvalidOperationException("OTP is invalid or expired.");

            user.PasswordHash = _identityServices.UserManager.PasswordHasher.HashPassword(user, dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _identityServices.UserManager.UpdateAsync(user);
        }

        public async Task<ForgotPasswordResponseDto> ForgotPasswordAsync(string email)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(email);
            if (user == null) return new ForgotPasswordResponseDto { Message = "If the email exists, an OTP has been sent." };

            string otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            user.PasswordResetToken = otp;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(5);
            await _identityServices.UserManager.UpdateAsync(user);

            string subject = "Your OTP for Password Reset";
            string body = $"<p>Hello {user.FullName},</p><p>Your OTP is: <strong>{otp}</strong></p><p>Expires in 5 minutes.</p>";
            await _emailService.SendEmailAsync(email, subject, body);

            return new ForgotPasswordResponseDto { Message = "OTP sent to your email." };
        }

        // -----------------------------
        // Firebase Google Login
        // -----------------------------


        public async Task<TokenDto> LoginWithGoogle(string idToken)
        {
            if (string.IsNullOrWhiteSpace(idToken))
                throw new Exception("ID token is required.");

            FirebaseToken decodedToken;
            try
            {
                // Verify Firebase ID token
                decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(idToken);
            }
            catch (Exception ex)
            {
                throw new Exception("Invalid Firebase ID token.", ex);
            }

            // Extract user info
            string email = decodedToken.Claims["email"]?.ToString()
                           ?? throw new Exception("Email not found in token");
            string name = decodedToken.Claims["name"]?.ToString() ?? email.Split('@')[0];

            // Check if user exists in your database
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                // Generate a secure password that satisfies ASP.NET Identity policies
                string securePassword = GenerateSecurePassword();

                var registerDto = new RegisterDto
                {
                    Email = email,
                    Name = name,
                    CreatePassword = securePassword
                };

                // Create user in database
                await CreateUserAsync(registerDto, UserRole.User);

                // Retrieve newly created user
                user = await _userRepository.GetByEmailAsync(email);
            }

            // Generate JWT tokens for your app
            return await GenerateTokensAsync(email);
        }

        // ------------------------------
        // Helper method to generate a secure password
        // ------------------------------
        private string GenerateSecurePassword()
        {
            // Example: ensures at least 1 uppercase, 1 lowercase, 1 digit, 1 symbol, length >= 12
            const string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string lower = "abcdefghijklmnopqrstuvwxyz";
            const string digits = "0123456789";
            const string symbols = "!@#$%^&*()-_=+";

            string password = "";
            var rand = new Random();

            password += upper[rand.Next(upper.Length)];
            password += lower[rand.Next(lower.Length)];
            password += digits[rand.Next(digits.Length)];
            password += symbols[rand.Next(symbols.Length)];

            // Fill the rest with random chars to reach length 12
            string allChars = upper + lower + digits + symbols;
            for (int i = password.Length; i < 12; i++)
            {
                password += allChars[rand.Next(allChars.Length)];
            }

            return password;
        }








        //public async Task<TokenDto> SocialLoginAsync(SocialLoginDto dto)
        //    {
        //        if (dto == null)
        //            throw new ArgumentNullException(nameof(dto));

        //        if (!string.IsNullOrEmpty(dto.IdToken))
        //        {
        //            // Handle Google login
        //            return await LoginWithGoogle(dto.IdToken);
        //        }

        //        // If you want to add other social providers (Facebook, Apple, etc.), handle them here
        //        throw new InvalidOperationException("Unsupported social login provider or missing IdToken.");
        //    }


        // -----------------------------
        // Helpers
        // -----------------------------
        private void SetJwtCookie(string accessToken)
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null || string.IsNullOrEmpty(accessToken)) return;

            int expirationMinutes = int.Parse(_configuration[$"JWT:{TokenKeys.AccessTokenExpirationMinutes}"] ?? "10");
            context.Response.Cookies.Append(CookieKeys.AccessToken, accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes)
            });
        }

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
