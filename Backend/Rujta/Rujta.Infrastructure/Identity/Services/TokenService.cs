using Rujta.Application.Interfaces.InterfaceServices.IAuth;

namespace Rujta.Infrastructure.Identity.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<TokenService> _logger;
        private readonly IMapper _mapper;

        private SymmetricSecurityKey _signingKey = null!;

        public TokenService(IConfiguration configuration,UserManager<ApplicationUser> userManager,IUnitOfWork unitOfWork,ILogger<TokenService> logger,IMapper mapper)
        {
            _configuration = configuration;
            _userManager = userManager;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;

            LoadSigningKey();
        }

        private void LoadSigningKey()
        {
            try
            {
                var secretKey =
                    Environment.GetEnvironmentVariable("JWT_SIGNING_KEY")
                    ?? _configuration["JWT:SigningKey"]
                    ?? throw new InvalidOperationException("JWT Signing Key is not configured.");

                if (secretKey.Length < 32)
                    throw new InvalidOperationException("JWT Signing Key must be at least 32 characters for security.");

                var keyBytes = Encoding.UTF8.GetBytes(secretKey);
                _signingKey = new SymmetricSecurityKey(keyBytes);

                _logger.LogInformation("JWT Signing Key loaded successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load JWT Signing Key.");
                throw new InvalidOperationException(
                    "Cannot initialize token service without JWT Signing Key.", ex);
            }
        }

        public async Task<string> GenerateAccessTokenAsync(
            ApplicationUserDto userDto,
            string? jwtId = null)
        {
            if (userDto == null)
                throw new ArgumentNullException(nameof(userDto));

            ApplicationUser user = _mapper.Map<ApplicationUser>(userDto);

            var employee = await _unitOfWork.People.GetByGuidAsync(user.DomainPersonId);
            if (employee == null)
                throw new InvalidOperationException("Employee not found.");

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim("domainPersonId", user.DomainPersonId.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.FullName ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, jwtId ?? Guid.NewGuid().ToString()),
                new Claim(
                    JwtRegisteredClaimNames.Iat,
                    new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(),
                    ClaimValueTypes.Integer64)
            };

            if (employee is Employee emp && emp.PharmacyId != null)
                claims.Add(new Claim("PharmacyId", emp.PharmacyId.Value.ToString()));

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var jwtSection = _configuration.GetSection("JWT");
            var issuer = jwtSection["Issuer"];
            var audience = jwtSection["Audience"];

            var accessTokenMinutes =
                double.TryParse(jwtSection[TokenKeys.AccessTokenExpirationMinutes], out var mins)
                    ? mins
                    : 10;

            var creds = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(accessTokenMinutes),
                signingCredentials: creds
            );

            _logger.LogInformation("Generated access token for user {UserId}", user.Id);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<string> GenerateRefreshTokenAsync(
            ApplicationUserDto userDto,
            string deviceId,
            bool rememberMe = false)
        {
            if (userDto == null)
                throw new ArgumentNullException(nameof(userDto));

            if (string.IsNullOrEmpty(deviceId))
                throw new SecurityTokenException(TokenMessages.DeviceIdRequired);

            ApplicationUser user = _mapper.Map<ApplicationUser>(userDto);

            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            using var sha256 = SHA256.Create();
            var hashedToken = Convert.ToBase64String(
                sha256.ComputeHash(Encoding.UTF8.GetBytes(rawToken))
            );

            var jwtSection = _configuration.GetSection("JWT");

            double refreshDays;
            if (rememberMe)
            {
                refreshDays =
                    double.TryParse(jwtSection[TokenKeys.RefreshTokenExpirationDays], out var longDays)
                        ? longDays
                        : 30;
            }
            else
            {
                refreshDays =
                    double.TryParse(jwtSection[TokenKeys.ShortRefreshTokenExpirationDays], out var shortDays)
                        ? shortDays
                        : 1;
            }

            var refreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = hashedToken,
                Expiration = DateTime.UtcNow.AddDays(refreshDays),
                Revoked = false,
                DeviceInfo = deviceId,
                LastUsedAt = null,
                RememberMe = rememberMe
            };

            await _unitOfWork.RefreshTokens.AddAsync(refreshToken);
            await _unitOfWork.SaveAsync();

            _logger.LogInformation(
                "Generated refresh token for user {UserId}, RememberMe: {RememberMe}, ExpiresIn: {Days} days",
                user.Id, rememberMe, refreshDays);

            return rawToken;
        }

        public async Task<RefreshToken?> VerifyRefreshTokenAsync(
            ApplicationUserDto userDto,
            string providedToken)
        {
            if (userDto == null || string.IsNullOrEmpty(providedToken))
                return null;

            var storedToken = await RefreshTokenHelper.GetValidRefreshTokenAsync(
                _unitOfWork.RefreshTokens,
                providedToken
            );

            if (storedToken == null)
            {
                _logger.LogWarning("Refresh token not found for user {UserId}", userDto.Id);
                return null;
            }

            if (storedToken.UserId != userDto.Id)
            {
                _logger.LogWarning(
                    "Refresh token does not belong to user {UserId}", userDto.Id);
                return null;
            }

            using var sha256 = SHA256.Create();
            var hashedInput = Convert.ToBase64String(
                sha256.ComputeHash(Encoding.UTF8.GetBytes(providedToken))
            );

            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(storedToken.Token),
                    Encoding.UTF8.GetBytes(hashedInput)))
            {
                _logger.LogWarning(
                    "Refresh token hash mismatch for user {UserId}", userDto.Id);
                return null;
            }

            _logger.LogInformation(
                "Refresh token verified successfully for user {UserId}", userDto.Id);

            return storedToken;
        }

        public async Task<(string Token, string Jti, DateTime Expiration)>
            GenerateAccessTokenFromRefreshTokenAsync(
                string rawRefreshToken,
                ApplicationUserDto userDto,
                string deviceId)
        {
            if (string.IsNullOrWhiteSpace(rawRefreshToken))
                throw new ArgumentException(TokenMessages.InvalidRefreshToken, nameof(rawRefreshToken));

            if (string.IsNullOrEmpty(deviceId))
                throw new SecurityTokenException(TokenMessages.DeviceIdRequired);

            var verifiedToken = await VerifyRefreshTokenAsync(userDto, rawRefreshToken);

            if (verifiedToken == null)
            {
                _logger.LogWarning(
                    "GenerateAccessTokenFromRefreshTokenAsync: Refresh token verification failed for user {UserId}",
                    userDto.Id);

                throw new SecurityTokenException(TokenMessages.InvalidRefreshToken);
            }

            if (!string.Equals(verifiedToken.DeviceInfo, deviceId, StringComparison.Ordinal))
            {
                _logger.LogWarning(
                    "Refresh token used from unknown device for user {UserId}", userDto.Id);
                throw new SecurityTokenException(TokenMessages.RefreshTokenUsedFromUnknownDevice);
            }

            var jwtId = Guid.NewGuid().ToString();

            var accessToken = await GenerateAccessTokenAsync(userDto, jwtId);

            verifiedToken.LastAccessTokenJti = jwtId;
            verifiedToken.LastUsedAt = DateTime.UtcNow;
            await _unitOfWork.SaveAsync();

            _logger.LogInformation(
                "Access token generated from refresh token for user {UserId}", userDto.Id);

            var jwtSection = _configuration.GetSection("JWT");
            var accessTokenMinutes =
                double.TryParse(jwtSection[TokenKeys.AccessTokenExpirationMinutes], out var mins)
                    ? mins
                    : 10;

            var expiration = DateTime.UtcNow.AddMinutes(accessTokenMinutes);

            return (accessToken, jwtId, expiration);
        }
    }
}