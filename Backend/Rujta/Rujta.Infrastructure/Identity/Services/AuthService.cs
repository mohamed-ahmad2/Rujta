using Microsoft.AspNetCore.Http;
using Rujta.Infrastructure.Identity.Helpers;

namespace Rujta.Infrastructure.Identity.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly TokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IMapper mapper,
            TokenService tokenService,
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            ILogger<AuthService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _mapper = mapper;
            _configuration = configuration;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<bool> CheckPasswordAsync(string email, string password, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("CheckPasswordAsync: User not found for email {Email}", email);
                return false;
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);

            _logger.LogInformation("CheckPasswordAsync: Password check for user {UserId} {Result}", user.Id, result.Succeeded);

            return result.Succeeded;
        }


        public async Task<Guid> CreateUserAsync(RegisterDto dto, Guid domainPersonId, UserRole role, CancellationToken cancellationToken = default)
        {
            var user = _mapper.Map<ApplicationUser>(dto);
            user.DomainPersonId = domainPersonId;

            var result = await _userManager.CreateAsync(user, dto.CreatePassword);
            if (!result.Succeeded)
            {
                _logger.LogError("Failed to create user {Email}", dto.Email);
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            await _userManager.AddToRoleAsync(user, role.ToString());

            _logger.LogInformation("CreateUserAsync: Created user {UserId} with role {Role}", user.Id, role);

            return user.Id;
        }


        public async Task<bool> IsEmailExistsAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByEmailAsync(email);
            var exists = user != null;

            _logger.LogInformation("IsEmailExistsAsync: Email {Email} exists = {Exists}", email, exists);

            return exists;
        }


        public async Task<TokenDto> GenerateTokensAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("GenerateTokensAsync: User not found for email {Email}", email);
                throw new InvalidOperationException("User not found");
            }

            ApplicationUserDto userDto = _mapper.Map<ApplicationUserDto>(user);

            return await GenerateTokenPairAsync(userDto);
        }

        
        public async Task<TokenDto> RefreshAccessTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                _logger.LogWarning("RefreshAccessTokenAsync: Refresh token is null or empty");
                throw new InvalidOperationException("Refresh token is required.");
            }

            var storedToken = await RefreshTokenHelper.GetValidRefreshTokenAsync(_unitOfWork.RefreshTokens, refreshToken);

            var user = await _userManager.FindByIdAsync(storedToken.UserId.ToString());
            if (user == null)
                throw new InvalidOperationException("User not found");

            ApplicationUserDto userDto = _mapper.Map<ApplicationUserDto>(user);

            return await GenerateTokenPairAsync(userDto);
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
            string? ipAddress = _httpContextAccessor?.HttpContext?.Connection?.RemoteIpAddress?.ToString();
            string? deviceInfo = refreshToken != null
                ? (await _unitOfWork.RefreshTokens.GetByTokenAsync(refreshToken))?.DeviceInfo
                : "All devices";

            if (refreshToken != null)
            {
                await _unitOfWork.RefreshTokens.ExecuteWithSerializableTransactionAsync(async () =>
                {
                    var token = await RefreshTokenHelper.GetValidRefreshTokenAsync(_unitOfWork.RefreshTokens, refreshToken);
                    if (token.UserId != userId) return;

                    token.Revoked = true;
                    token.RevokedAt = DateTime.UtcNow;
                    await _unitOfWork.SaveAsync();
                });

            }
            else
                await RevokeOldRefreshTokensAsync(userId);

            _logger.LogInformation(
                "Logout executed for user {UserId} from IP {IP} using {Device}",
                userId, ipAddress, deviceInfo
            );
        }

        private async Task<TokenDto> GenerateTokenPairAsync(ApplicationUserDto userDto)
        {
            await RevokeOldRefreshTokensAsync(userDto.Id);
            var refreshToken = await _tokenService.GenerateRefreshTokenAsync(userDto);
            var (accessToken, accessTokenJti, accessTokenExpiration) = await _tokenService.GenerateAccessTokenFromRefreshTokenAsync(refreshToken, userDto);

            var refreshTokenExpiration = DateTime.UtcNow.AddDays(
                double.TryParse(_configuration["JWT:RefreshTokenExpirationDays"], out var days) ? days : 30
            );

            return new TokenDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                RefreshTokenExpiration = refreshTokenExpiration,
                AccessTokenExpiration = accessTokenExpiration,
                AccessTokenJti = accessTokenJti
            };
        }

        private async Task RevokeOldRefreshTokensAsync(Guid userId)
        {
            var tokens = await _unitOfWork.RefreshTokens.GetAllValidTokensByUserIdAsync(userId);
            foreach (var token in tokens)
            {
                token.Revoked = true;
                token.RevokedAt = DateTime.UtcNow;
            }
            await _unitOfWork.SaveAsync();
        }
    }
}
