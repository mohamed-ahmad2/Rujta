using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Rujta.Infrastructure.Extensions
{
    public static class JwtConfiguration
    {
        private static class HubPaths
        {
            public const string Presence = "/hubs/presence";
            public const string Notifications = "/hubs/notifications";
            public const string Orders = "/hubs/orders";
        }

        private static readonly PathString[] SignalRHubPaths =
        [
            new(HubPaths.Presence),
            new(HubPaths.Notifications),
            new(HubPaths.Orders),
        ];

        public static IServiceCollection AddJwtAuthentication(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var jwtSection = configuration.GetSection("JWT");

            if (!jwtSection.Exists())
                throw new InvalidOperationException("JWT configuration section is missing.");

            var secretKey = Environment.GetEnvironmentVariable("JWT_SIGNING_KEY")
                           ?? jwtSection["SecretKey"];

            if (string.IsNullOrWhiteSpace(secretKey))
                throw new InvalidOperationException("JWT SecretKey is missing.");

            var issuer = jwtSection["Issuer"];
            var audience = jwtSection["Audience"];

            if (string.IsNullOrWhiteSpace(issuer))
                throw new InvalidOperationException("JWT Issuer is missing.");

            if (string.IsNullOrWhiteSpace(audience))
                throw new InvalidOperationException("JWT Audience is missing.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = issuer,

                        ValidateAudience = true,
                        ValidAudience = audience,

                        ValidateLifetime = true,

                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = key,

                        ClockSkew = TimeSpan.FromSeconds(30),

                        NameClaimType = JwtRegisteredClaimNames.Sub,
                        RoleClaimType = ClaimTypes.Role
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = ExtractSignalRToken
                    };
                });

            return services;
        }

        private static Task ExtractSignalRToken(MessageReceivedContext context)
        {
            var accessToken = context.Request.Query["access_token"];

            if (string.IsNullOrEmpty(accessToken))
                return Task.CompletedTask;

            var path = context.HttpContext.Request.Path;

            if (SignalRHubPaths.Any(hubPath => path.StartsWithSegments(hubPath)))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    }
}