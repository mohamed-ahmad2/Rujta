using Microsoft.EntityFrameworkCore;
using Rujta.API.Realtime.Services;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices.IAuth;
using Rujta.Application.Interfaces.InterfaceServices.IMedicine;
using Rujta.Application.Notifications;
using Rujta.Infrastructure.Data;
using Rujta.Infrastructure.Repositories;
using Rujta.Infrastructure.Services;

namespace Rujta.API
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Logging.AddConsole();

            // Add services
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddCustomSwagger();

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
            builder.Services.AddSingleton<INotificationPublisher, SignalRNotificationPublisher>();
            builder.Services.AddScoped<IOrderNotificationService, OrderNotificationService>();
            builder.Services.AddScoped<ICustomerOrderService, CustomerOrderService>();
            builder.Services.AddScoped<IReportService, ReportService>();
            builder.Services.AddScoped<ISuperAdminService, SuperAdminService>();
            builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
            builder.Services.AddScoped<IDrugHistoryRepository, DrugHistoryRepository>();

            builder.Services.AddHttpClient<IDrugInteractionService, DrugInteractionService>(client =>
            {
                client.BaseAddress = new Uri(
                    builder.Configuration["MlService:BaseUrl"] ?? "http://localhost:8000");
                client.Timeout = TimeSpan.FromSeconds(30);
            });
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

            var logger = app.Services
                .GetRequiredService<ILoggerFactory>()
                .CreateLogger("Rujta.API");


            try
            {
                FirebaseInitializer.Initialize();
                logger.LogInformation("Firebase initialized successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Firebase initialization failed.");
            }

            app.Use(async (context, next) =>
            {
                context.Response.Headers["Content-Security-Policy"] =
                    "default-src 'self'; script-src 'self'";
                await next();
            });

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
            app.UseRouting();
            app.UseRateLimiter();
            app.UseCors("AllowReactApp");

            app.UseWebSockets(new WebSocketOptions
            {
                KeepAliveInterval = TimeSpan.FromSeconds(60),
                AllowedOrigins =
                {
                    "https://localhost:5173",
                    "http://localhost:5173",
                    "https://rujta.vercel.app"
                }
            });

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapHub<PresenceHub>("/hubs/presence");
            app.MapHub<NotificationHub>("/hubs/notifications");
            app.MapHub<OrderHub>("/hubs/orders");

            app.MapControllers();

            await using var scope = app.Services.CreateAsyncScope();
            var scopedServices = scope.ServiceProvider;

            try
            {
                var roleManager = scopedServices
                    .GetRequiredService<RoleManager<IdentityRole<Guid>>>();

                await IdentitySeeder.SeedRolesAsync(roleManager);

                logger.LogInformation("Role seeding completed successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Role seeding failed. App will continue without seeding.");
            }

            try
            {
                var unitOfWork = scopedServices.GetRequiredService<IUnitOfWork>();
                var autocomplete = scopedServices.GetRequiredService<IMedicineAutocompleteIndex>();

                var medicines = await unitOfWork.Medicines.GetAllAsync();
                autocomplete.Build(medicines.Select(m => m.Name!));

                logger.LogInformation("Medicine autocomplete index built successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Autocomplete index build failed. App will continue without it.");
            }

            await app.RunAsync();

            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                var conn = builder.Configuration.GetConnectionString("DefaultConnection");

                Console.WriteLine("DB USED BY EF: " + conn);

                options.UseSqlServer(conn);
            });
        }
    }
}