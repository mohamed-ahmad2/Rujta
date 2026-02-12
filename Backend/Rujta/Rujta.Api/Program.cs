using Polly;
using Rujta.API.Hubs;
using Rujta.Application.MappingProfiles;
using Rujta.Domain.Hubs;
using Rujta.Infrastructure.Extensions;
using Rujta.Infrastructure.Firebase;
using Rujta.Infrastructure.Identity.Services;
using System.Text.Json.Serialization;

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
            builder.Services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddCustomSwagger();


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

            builder.Services.AddScoped<ICustomerOrderService, CustomerOrderService>();
            builder.Services.AddScoped<IReportService, ReportService>();
            builder.Services.AddScoped<ISuperAdminService, SuperAdminService>();



            // Firebase Initialization
            try
            {
                FirebaseInitializer.Initialize();
                Console.WriteLine("Firebase initialized successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error initializing Firebase: {ex.Message}");
            }

            builder.Services.AddCustomRateLimiting();

            builder.WebHost.ConfigureKestrel(options =>
            {
                options.Limits.MaxRequestBodySize = 10 * 1024 * 1024;
            });

            builder.Services.AddHttpClient("Default")
                    .SetHandlerLifetime(TimeSpan.FromMinutes(5))
                    .AddPolicyHandler(Policy.TimeoutAsync<HttpResponseMessage>(10));


            var app = builder.Build();

            app.Use(async (context, next) =>
            {
                context.Response.Headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'";
                await next();
            });



            // -------------------------------
            // Middleware
            // -------------------------------
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            else
            {
                app.UseExceptionHandler("/api/error");
                app.UseHsts();
            }

            

            app.UseHttpsRedirection();

            app.UseCors("AllowReactApp");

            app.UseRateLimiter();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapHub<PresenceHub>("/hubs/presence");
            app.MapHub<NotificationHub>("/notificationHub");

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

            await app.RunAsync();
        }
    }
}
