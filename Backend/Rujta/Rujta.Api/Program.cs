using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.OpenApi.Models;
using Rujta.Application.MappingProfiles;
using Rujta.Domain.Hubs;
using Rujta.Infrastructure.Extensions;

namespace Rujta.API
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Logging.AddConsole();

            // -------------------------------
            // Add services
            // -------------------------------
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                    {
                        Name = "Authorization",
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "JWT",
                        In = ParameterLocation.Header
                    });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });


            builder.Services.AddAutoMapper(typeof(StaffProfile).Assembly);

            // Database
            builder.Services.AddCustomDatabase(builder.Configuration);

            // Identity & Authorization
            builder.Services.AddCustomIdentity();
            builder.Services.AddCustomAuthorizationPolicies();
            builder.Services.AddSingleton<IAuthorizationHandler, SamePharmacyHandler>();

            // JWT
            builder.Services.AddJwtAuthentication(builder.Configuration);

            // CORS
            builder.Services.AddCustomCors();

            // FluentValidation
            builder.Services.AddCustomFluentValidation();

            // Application Services
            builder.Services.AddApplicationServices(builder.Configuration);

            // -------------------------------
            // Firebase Admin SDK
            // -------------------------------
            // Make sure to put the JSON in your project and update the path

            // Firebase Initialization
            try
            {
                var credentialPath = Path.Combine(AppContext.BaseDirectory, "Firebase", "Service-account.json");
                if (File.Exists(credentialPath))
                {
                    var serviceAccountCredential = CredentialFactory
                        .FromFile<ServiceAccountCredential>(credentialPath)
                        .ToGoogleCredential();

                    FirebaseApp.Create(new AppOptions()
                    {
                        Credential = serviceAccountCredential
                    });

                    Console.WriteLine("Firebase initialized successfully!");
                }
                else
                {
                    Console.WriteLine($"Firebase JSON not found at {credentialPath}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing Firebase: {ex.Message}");
            }

            var app = builder.Build();

            // -------------------------------
            // Middleware
            // -------------------------------
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowReactApp");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            // -------------------------------
            // Role seeding
            // -------------------------------
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
                await IdentitySeeder.SeedRolesAsync(roleManager);
            }

            // SignalR Hub
            app.MapHub<NotificationHub>("/notificationHub");

            await app.RunAsync();
        }
    }
}
