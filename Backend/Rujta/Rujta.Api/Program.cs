using Microsoft.AspNetCore.SignalR;
using Rujta.API.Realtime.Services;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices.IMedicine;
using Rujta.Application.Notifications;
using Rujta.Infrastructure.Services;
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

            builder.Services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(AppDomain.CurrentDomain.GetAssemblies());
            });

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
            builder.Services.AddScoped<INotificationPublisher, SignalRNotificationPublisher>();
            builder.Services.AddScoped<INotificationService, NotificationService>();
            builder.Services.AddScoped<IOrderNotificationService, OrderNotificationService>();
            builder.Services.AddScoped<ICustomerOrderService, CustomerOrderService>();
            builder.Services.AddScoped<IReportService, ReportService>();
            builder.Services.AddScoped<ISuperAdminService, SuperAdminService>();

            // 🔥🔥🔥 ADD THIS (SignalR Registration)
            builder.Services.AddSignalR();

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
                context.Response.Headers["Content-Security-Policy"] =
                    "default-src 'self'; script-src 'self'";
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

            app.UseWebSockets();

            app.UseRateLimiter();

            app.UseAuthentication();
            app.UseAuthorization();

            // 🔥 Standardized Hub Routes
            app.MapHub<PresenceHub>("/hubs/presence");
            app.MapHub<NotificationHub>("/hubs/notifications");
            app.MapHub<OrderHub>("/hubs/orders");

            app.MapControllers();

            // -------------------------------
            // Role seeding
            // -------------------------------
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var roleManager =
                    services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

                await IdentitySeeder.SeedRolesAsync(roleManager);
            }

            using (var scope = app.Services.CreateScope())
            {
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var autocomplete =
                    scope.ServiceProvider.GetRequiredService<IMedicineAutocompleteIndex>();

                var medicines = await unitOfWork.Medicines.GetAllAsync();
                autocomplete.Build(medicines.Select(m => m.Name!));
            }

            await app.RunAsync();
        }
    }
}