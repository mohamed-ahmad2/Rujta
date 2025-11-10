namespace Rujta.Infrastructure.Identity.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly TokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly ILogger<UserService> _logger;

        public UserService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IMapper mapper,
            TokenService tokenService,
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            ILogger<UserService> logger)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _mapper = mapper;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> CheckPasswordAsync(string email, string password, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("CheckPasswordAsync: User not found for email {Email}", email);
                return false;
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, password, false);

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
                _logger.LogError("CreateUserAsync: Failed to create user {Email}. Errors: {Errors}", dto.Email, string.Join(", ", result.Errors.Select(e => e.Description)));
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            await _userManager.AddToRoleAsync(user, role.ToString());

            _logger.LogInformation("CreateUserAsync: Created user {UserId} with role {Role}", user.Id, role);

            return user.Id;
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
            var accessToken = await _tokenService.GenerateAccessTokenAsync(userDto);
            var refreshToken = await _tokenService.GenerateRefreshTokenAsync(userDto);

            var refreshTokenExpiration = DateTime.UtcNow.AddDays(
                double.TryParse(_configuration["JWT:RefreshTokenExpirationDays"], out var days) ? days : 30
            );

            _logger.LogInformation("GenerateTokensAsync: Generated tokens for user {UserId}", user.Id);

            return new TokenDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                RefreshTokenExpiration = refreshTokenExpiration
            };
        }

        public async Task<bool> IsEmailExistsAsync(string email, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByEmailAsync(email);
            var exists = user != null;

            _logger.LogInformation("IsEmailExistsAsync: Email {Email} exists = {Exists}", email, exists);

            return exists;
        }

        public async Task<TokenDto> RefreshTokensAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                _logger.LogWarning("RefreshTokensAsync: Refresh token is null or empty");
                throw new InvalidOperationException("Refresh token is required.");
            }

            ApplicationUser? userFound = null;

            await foreach (var user in _userManager.Users.AsAsyncEnumerable().WithCancellation(cancellationToken))
            {
                var token = await _userManager.GetAuthenticationTokenAsync(user, TokenProviderConstants.AppProvider, TokenKeys.RefreshToken);
                if (token == refreshToken)
                {
                    userFound = user;
                    break;
                }
            }

            if (userFound == null)
            {
                _logger.LogWarning("RefreshTokensAsync: Invalid refresh token used");
                throw new InvalidOperationException("Invalid refresh token.");
            }

            var tokenExpirationStr = await _userManager.GetAuthenticationTokenAsync(userFound, TokenProviderConstants.AppProvider, TokenKeys.RefreshTokenExpiration);

            if (!DateTime.TryParse(tokenExpirationStr, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var tokenExpiration))
            {
                _logger.LogError("RefreshTokensAsync: Invalid token expiration for user {UserId}", userFound.Id);
                throw new InvalidOperationException("Invalid refresh token expiration.");
            }

            if (tokenExpiration < DateTime.UtcNow)
            {
                _logger.LogWarning("RefreshTokensAsync: Refresh token expired for user {UserId}", userFound.Id);
                throw new InvalidOperationException("Refresh token expired.");
            }

            ApplicationUserDto userDtoFound = _mapper.Map<ApplicationUserDto>(userFound);
            var newAccessToken = await _tokenService.GenerateAccessTokenAsync(userDtoFound);
            var newRefreshToken = await _tokenService.GenerateRefreshTokenAsync(userDtoFound);

            var refreshTokenExpiration = DateTime.UtcNow.AddDays(
                double.TryParse(_configuration["JWT:RefreshTokenExpirationDays"], out var days) ? days : 30
            );

            await _userManager.SetAuthenticationTokenAsync(userFound, TokenProviderConstants.AppProvider, TokenKeys.RefreshToken, newRefreshToken);
            await _userManager.SetAuthenticationTokenAsync(userFound, TokenProviderConstants.AppProvider, TokenKeys.RefreshTokenExpiration, refreshTokenExpiration.ToString("o"));

            _logger.LogInformation("RefreshTokensAsync: Refreshed tokens for user {UserId}", userFound.Id);

            return new TokenDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                RefreshTokenExpiration = refreshTokenExpiration
            };
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
    }
}
