namespace Rujta.Infrastructure.Identity.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<TokenService> _logger;
        private readonly IMapper _mapper;

        private  RsaSecurityKey _privateKey = null!;
        private  RsaSecurityKey _publicKey = null!;


        public TokenService(
            IConfiguration configuration,
            UserManager<ApplicationUser> userManager,
            IUnitOfWork unitOfWork,
            ILogger<TokenService> logger,
            IMapper mapper)
        {
            _configuration = configuration;
            _userManager = userManager;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _mapper = mapper;

            LoadCertificate();
        }

        private void LoadCertificate()
        {
            try
            {
                var certPath = Path.Combine(AppContext.BaseDirectory, "Certificates", "jwt-cert.pfx");
                var certPassword = _configuration["JWT:CertPassword"] ?? "yourpassword";

                if (!File.Exists(certPath))
                    throw new FileNotFoundException($"Certificate file not found at path: {certPath}");

                var cert = new X509Certificate2(certPath, certPassword, X509KeyStorageFlags.EphemeralKeySet);

                _privateKey = new RsaSecurityKey(cert.GetRSAPrivateKey());
                _publicKey = new RsaSecurityKey(cert.GetRSAPublicKey());

                _logger.LogInformation("JWT certificate loaded successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to load JWT certificate");
                throw new InvalidOperationException("Cannot initialize TokenService without JWT certificate", ex);
            }
        }

        public async Task<string> GenerateAccessTokenAsync(ApplicationUserDto userDto, string? jwtId = null)
        {
            if (userDto == null)
                throw new ArgumentNullException(nameof(userDto));

            ApplicationUser user = _mapper.Map<ApplicationUser>(userDto);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Name, user.FullName ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Jti, jwtId ?? Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat,
                    new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var jwtSection = _configuration.GetSection("JWT");
            var issuer = jwtSection["Issuer"];
            var audience = jwtSection["Audience"];
            var accessTokenMinutes = double.TryParse(jwtSection["AccessTokenExpirationMinutes"], out var mins) ? mins : 10;

            var creds = new SigningCredentials(_privateKey, SecurityAlgorithms.RsaSha256);

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

        public async Task<string> GenerateRefreshTokenAsync(ApplicationUserDto userDto)
        {
            if (userDto == null)
                throw new ArgumentNullException(nameof(userDto));

            ApplicationUser user = _mapper.Map<ApplicationUser>(userDto);

            var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

            using var sha256 = SHA256.Create();
            var hashedToken = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(rawToken)));

            var jwtSection = _configuration.GetSection("JWT");
            var refreshDays = double.TryParse(jwtSection["RefreshTokenExpirationDays"], out var days) ? days : 30;

            var refreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = hashedToken,
                Expiration = DateTime.UtcNow.AddDays(refreshDays),
                Revoked = false,
                DeviceInfo = user.DeviceInfo,
                LastUsedAt = null
            };

            await _unitOfWork.RefreshTokens.AddAsync(refreshToken);
            await _unitOfWork.SaveAsync();

            _logger.LogInformation("Generated refresh token for user {UserId}", user.Id);

            return rawToken;
        }

        public async Task<RefreshToken?> VerifyRefreshTokenAsync(ApplicationUserDto userDto, string providedToken)
        {
            if (userDto == null || string.IsNullOrEmpty(providedToken))
                return null;

            ApplicationUser user = _mapper.Map<ApplicationUser>(userDto);

            using var sha256 = SHA256.Create();
            var hashedInput = Convert.ToBase64String(
                sha256.ComputeHash(Encoding.UTF8.GetBytes(providedToken))
            );

            var token = await _unitOfWork.RefreshTokens.GetValidTokenAsync(user.Id, hashedInput);

            if (token == null)
            {
                _logger.LogWarning("Refresh token not found or expired for user {UserId}", user.Id);
                return null;
            }

            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(token.Token),
                    Encoding.UTF8.GetBytes(hashedInput)))
            {
                _logger.LogWarning("Refresh token verification failed for user {UserId}", user.Id);
                return null;
            }

            token.Revoked = true;
            token.RevokedAt = DateTime.UtcNow;
            await _unitOfWork.SaveAsync();

            _logger.LogInformation("Refresh token revoked for user {UserId}", user.Id);

            return token;
        }

        public async Task<string> GenerateAccessTokenFromRefreshTokenAsync(string rawRefreshToken)
        {
            if (string.IsNullOrWhiteSpace(rawRefreshToken))
                throw new ArgumentException("Invalid refresh token", nameof(rawRefreshToken));

            using var sha256 = SHA256.Create();
            var hashedToken = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(rawRefreshToken)));

            var storedToken = await _unitOfWork.RefreshTokens.GetByTokenAsync(hashedToken);
            if (storedToken == null || storedToken.Expiration < DateTime.UtcNow)
                throw new SecurityTokenException("Invalid or expired refresh token");

            var user = await _userManager.FindByIdAsync(storedToken.UserId.ToString());
            if (user == null)
                throw new InvalidOperationException("User not found");

            if (storedToken.DeviceInfo != user.DeviceInfo)
            {
                _logger.LogWarning("Refresh token used from unknown device for user {UserId}", user.Id);
                throw new SecurityTokenException("Refresh token used from unknown device");
            }

            if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(hashedToken),
                Encoding.UTF8.GetBytes(storedToken.Token)))
            {
                _logger.LogWarning("Refresh token verification failed for user {UserId}", user.Id);
                throw new SecurityTokenException("Invalid refresh token");
            }

            var jwtId = Guid.NewGuid().ToString();
            ApplicationUserDto userDto = _mapper.Map<ApplicationUserDto>(user);
            var accessToken = await GenerateAccessTokenAsync(userDto, jwtId);

            storedToken.Revoked = true;
            storedToken.LastAccessTokenJti = jwtId;
            storedToken.LastUsedAt = DateTime.UtcNow;
            await _unitOfWork.SaveAsync();

            _logger.LogInformation("Access token generated from refresh token for user {UserId}", user.Id);

            return accessToken;
        }

        public RsaSecurityKey GetPublicKey() => _publicKey;
    }
}
