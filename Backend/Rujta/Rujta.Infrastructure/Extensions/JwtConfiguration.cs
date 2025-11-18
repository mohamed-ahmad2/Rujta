using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;


namespace Rujta.Infrastructure.Extensions
{
    public static class JwtConfiguration
    {
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
        {
            var jwtSection = configuration.GetSection("JWT");

            var certPath = Path.Combine(AppContext.BaseDirectory, "Certificates", "jwt-cert.pfx");
            var certPassword = Environment.GetEnvironmentVariable("JWT__CertPassword");

            if (string.IsNullOrWhiteSpace(certPassword))
                throw new InvalidOperationException("JWT certificate password not found in environment variables.");


            var certificate = new X509Certificate2(certPath, certPassword);
            var rsa = certificate.GetRSAPublicKey();
            var publicKey = new RsaSecurityKey(rsa);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSection["Issuer"],

                    ValidateAudience = true,
                    ValidAudience = jwtSection["Audience"],

                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    IssuerSigningKey = publicKey,
                    ClockSkew = TimeSpan.FromSeconds(30)
                };
            });

            return services;
        }
    }
}
