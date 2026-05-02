using Microsoft.OpenApi.Models;
using System.Reflection;

namespace Rujta.Infrastructure.Extensions
{
    public static class SwaggerExtensions
    {
        private static readonly OpenApiSecurityScheme BearerSecurityScheme = new()
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        };

        private static readonly OpenApiSecurityRequirement SecurityRequirement = new()
        {
            { BearerSecurityScheme, [] }
        };

        public static IServiceCollection AddCustomSwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Rujta API",
                    Version = "v1",
                    Description = "Rujta Pharmacy Platform API"
                });

                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter your JWT token. Example: Bearer {token}"
                });

                options.AddSecurityRequirement(SecurityRequirement);

                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);

                if (File.Exists(xmlPath))
                    options.IncludeXmlComments(xmlPath);
            });

            return services;
        }
    }
}