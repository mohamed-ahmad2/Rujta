using FirebaseAdmin.Auth;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Application.Services;
using Rujta.Domain.Common;
using Rujta.Infrastructure.Helperrs;
using Rujta.Infrastructure.Identity.Helpers;
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

        public AuthService(
            IdentityServices identityServices,
            IMapper mapper,
            IUnitOfWork unitOfWork,
            ILogger<AuthService> logger,
            IHttpContextAccessor httpContextAccessor,
            TokenHelper tokenHelper,
            IConfiguration configuration,
            IEmailService emailService)
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


        public async Task<ApplicationUserDto?> GetUserByEmailAsync(string email)
        {
            return await _unitOfWork.Users.GetByEmailAsync(email);
        }


        public async Task<bool> CheckPasswordAsync(string email, string password, CancellationToken cancellationToken = default)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("CheckPasswordAsync: User not found for email {Email}", email);
                return false;
            }

            var result = await _identityServices.SignInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);

            _logger.LogInformation("CheckPasswordAsync: Password check for user {UserId} {Result}", user.Id, result.Succeeded);

            return result.Succeeded;
        }


        public async Task<Guid> CreateUserAsync(RegisterDto dto, UserRole role, CancellationToken cancellationToken = default)
        {

            Person person;

            switch (role)
            {
                case UserRole.User:
                    person = _mapper.Map<User>(dto);
                    break;
                case UserRole.Pharmacist:
                    person = _mapper.Map<Pharmacist>(dto);
                    break;
                case UserRole.Admin:
                    person = _mapper.Map<Admin>(dto);
                    break;
                case UserRole.Manager:
                    person = _mapper.Map<Manager>(dto);
                    break;
                default:
                    throw new InvalidOperationException(AuthMessages.UnknownRole);
            }

            await _unitOfWork.People.AddAsync(person);
            await _unitOfWork.SaveAsync();


            var user = _mapper.Map<ApplicationUser>(dto);
            user.DomainPersonId = person.Id;

            var result = await _identityServices.UserManager.CreateAsync(user, dto.CreatePassword);
            if (!result.Succeeded)
            {
                _logger.LogError("Failed to create user {Email}", dto.Email);
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            await _identityServices.UserManager.AddToRoleAsync(user, role.ToString());

            _logger.LogInformation("CreateUserAsync: Created user {UserId} with role {Role}", user.Id, role);

            return user.Id;
        }



        public async Task<bool> IsEmailExistsAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(email);
            var exists = user != null;

            _logger.LogInformation("IsEmailExistsAsync: Email {Email} exists = {Exists}", email, exists);

            return exists;
        }


        public async Task<TokenDto> GenerateTokensAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("GenerateTokensAsync: User not found for email {Email}", email);
                throw new InvalidOperationException(AuthMessages.UserNotFound);
            }

            ApplicationUserDto userDto = _mapper.Map<ApplicationUserDto>(user);

            var context = _httpContextAccessor.HttpContext!;
            var cookies = context.Request.Cookies;
            string? deviceId;

            if (!cookies.TryGetValue(CookieKeys.DeviceId, out deviceId))
            {
                deviceId = Guid.NewGuid().ToString();

                context.Response.Cookies.Append(CookieKeys.DeviceId, deviceId, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTime.UtcNow.AddYears(1),
                    Domain = "localhost"
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
            else
            {
                var existingDevice = await _unitOfWork.Devices.GetByDeviceIdAsync(deviceId);
                if (existingDevice != null)
                {
                    existingDevice.LastUsedAt = DateTime.UtcNow;
                    await _unitOfWork.SaveAsync();
                }
            }

            bool loginOrRegister = true;
            var tokens = await _tokenHelper.GenerateTokenPairAsync(userDto, deviceId, loginOrRegister);


            SetRefreshTokenCookie(tokens.RefreshToken);
            SetJwtCookie(tokens.AccessToken);

            return tokens;
        }


        public async Task<TokenDto> RefreshAccessTokenAsync(string? refreshToken, CancellationToken cancellationToken = default)
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null)
                throw new InvalidOperationException(AuthMessages.HttpContextIsNull);

            if (string.IsNullOrWhiteSpace(refreshToken))
                refreshToken = context.Request.Cookies[CookieKeys.RefreshToken];

            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                _logger.LogWarning("RefreshAccessTokenAsync: Refresh token is null or empty");
                throw new InvalidOperationException(AuthMessages.RefreshTokenRequired);
            }

            var storedToken = await RefreshTokenHelper.GetValidRefreshTokenAsync(_unitOfWork.RefreshTokens, refreshToken);
            if (storedToken == null)
            {
                _logger.LogWarning("RefreshAccessTokenAsync: Invalid or expired refresh token");
                throw new InvalidOperationException(AuthMessages.InvalidOrExpiredRefreshToken);
            }

            var user = await _identityServices.UserManager.FindByIdAsync(storedToken.UserId.ToString());
            if (user == null)
                throw new InvalidOperationException(AuthMessages.UserNotFound);

            ApplicationUserDto userDto = _mapper.Map<ApplicationUserDto>(user);

            var deviceId = storedToken.DeviceInfo;
            if (string.IsNullOrEmpty(deviceId))
            {
                _logger.LogWarning("RefreshAccessTokenAsync: DeviceId missing in refresh token");
                throw new InvalidOperationException(AuthMessages.DeviceIdRequired);
            }

            bool loginOrRegister = false;
            var tokens = await _tokenHelper.GenerateTokenPairAsync(userDto, deviceId, loginOrRegister, refreshToken);

            SetRefreshTokenCookie(tokens.RefreshToken);
            SetJwtCookie(tokens.AccessToken);

            return tokens;
        }


        public async Task<UserProfileDto?> GetUserProfileAsync(Guid userId)
        {
            var profile = await _unitOfWork.Users.GetProfileAsync(userId);
            _logger.LogInformation("GetUserProfileAsync: Retrieved profile for user {UserId}", userId);
            return profile;
        }

        public async Task<bool> UpdateUserProfileAsync(Guid userId, UpdateUserProfileDto dto)
        {
            var updated = await _unitOfWork.Users.UpdateProfileAsync(userId, dto);
            _logger.LogInformation("UpdateUserProfileAsync: Updated profile for user {UserId} = {Updated}", userId, updated);
            return updated;
        }

        public async Task LogoutAsync(Guid userId, string? refreshToken = null)
        {
            var context = _httpContextAccessor?.HttpContext;
            var ipAddress = context?.Connection?.RemoteIpAddress?.MapToIPv4().ToString();
            var deviceId = context?.Request.Cookies[CookieKeys.DeviceId];

            if (!string.IsNullOrEmpty(refreshToken))
            {
                await _unitOfWork.RefreshTokens.ExecuteWithSerializableTransactionAsync(async () =>
                {
                    var token = await RefreshTokenHelper.GetValidRefreshTokenAsync(_unitOfWork.RefreshTokens, refreshToken);
                    if (token == null || token.UserId != userId) return;

                    token.Revoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                    await _unitOfWork.SaveAsync();
                });

                _logger.LogInformation(
                    "Logout executed for user {UserId} from IP {IP} using refresh token {RefreshToken}",
                    userId, ipAddress, refreshToken
                );
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

                _logger.LogInformation(
                    "Logout executed for user {UserId} from IP {IP} using device {DeviceId}",
                    userId, ipAddress, deviceId
                );
            }
            else
            {
                await _tokenHelper.RevokeOldRefreshTokensAsync(userId);
                _logger.LogInformation(
                    "Logout executed for user {UserId} from IP {IP} for all devices",
                    userId, ipAddress
                );
            }
        }


        private void SetJwtCookie(string accessToken)
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null || string.IsNullOrEmpty(accessToken)) return;
            var expirationMinutes = int.Parse(
                _configuration[$"JWT:{TokenKeys.AccessTokenExpirationMinutes}"] ?? "10"
            );

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            };

            context.Response.Cookies.Append(CookieKeys.AccessToken, accessToken, cookieOptions);
        }

        private void SetRefreshTokenCookie(string? refreshToken)
        {
            var context = _httpContextAccessor.HttpContext;
            if (context == null || string.IsNullOrEmpty(refreshToken)) return;


            int expirationDays = 30;
            var configValue = _configuration[$"JWT:{TokenKeys.RefreshTokenExpirationDays}"] ?? "30";
            if (!string.IsNullOrEmpty(configValue) && int.TryParse(configValue, out int days))
            {
                expirationDays = days;
            }


            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(expirationDays),
            };

            context.Response.Cookies.Append(CookieKeys.RefreshToken, refreshToken, cookieOptions);
        }







        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(dto.Email);

            if (user == null)
                throw new InvalidOperationException("Invalid OTP or email.");

            if (user.PasswordResetToken != dto.Otp ||
                user.PasswordResetTokenExpiry < DateTime.UtcNow)
            {
                throw new InvalidOperationException("OTP is invalid or expired.");
            }

            var hashedPassword = _identityServices.UserManager.PasswordHasher.HashPassword(user, dto.NewPassword);
            user.PasswordHash = hashedPassword;

            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _identityServices.UserManager.UpdateAsync(user);
        }







        public async Task<ForgotPasswordResponseDto> ForgotPasswordAsync(string email)
        {
            var user = await _identityServices.UserManager.FindByEmailAsync(email);

            if (user == null)
                return new ForgotPasswordResponseDto
                {
                    Message = "If the email exists, an OTP has been sent."
                };

            var otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

            user.PasswordResetToken = otp;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(5);

            await _identityServices.UserManager.UpdateAsync(user);

            string subject = "Your OTP for Password Reset";
            string body = $"<p>Hello {user.FullName},</p>" +
                          $"<p>Your OTP to reset your password is: <strong>{otp}</strong></p>" +
                          $"<p>This OTP will expire in 5 minutes.</p>";

            await _emailService.SendEmailAsync(email, subject, body);

            return new ForgotPasswordResponseDto
            {
                Message = "OTP sent to your email."
            };
        }


        public Task<TokenDto> SocialLoginAsync(SocialLoginDto dto)
        {
            throw new NotImplementedException();
        }
    }
}