

namespace Rujta.Infrastructure.Extensions
{
    public static class CorsConfiguration
    {
        public static IServiceCollection AddCustomCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                    policy.WithOrigins(
                            "https://localhost:5173",
                            "http://localhost:5173",
                            "http://localhost:3000",
                            "https://rujta.vercel.app",
                            "https://rujta.runasp.net")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
            });

            return services;
        }
    }
}
