using Microsoft.Extensions.DependencyInjection;
using Rujta.Application.Services;
using Rujta.Infrastructure.BackgroundJobs;
using Rujta.Infrastructure.Helperrs;
using Rujta.Infrastructure.Identity.Helpers;
using Rujta.Infrastructure.Identity.Services;
using Rujta.Infrastructure.Repositories;
using Rujta.Infrastructure.Services;


namespace Rujta.Infrastructure.Extensions
{
    public static class ApplicationServicesConfiguration
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Mapper
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            // SignalR
            services.AddSignalR();

            // Scoped services
            services.AddScoped<TokenService>();
            services.AddScoped<TokenHelper>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IMedicineService, MedicineService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPharmacyRepository, PharmacyRepo>();
            services.AddScoped<PharmacyDistanceService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<ILogService, LogService>();


            services.AddScoped<PharmacyDistanceService>();

            // HttpClient services
            services.AddHttpClient<MedicineDataImportService>();

            var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            var solutionRoot = Path.GetFullPath(Path.Combine(baseDirectory, @"..\..\..\..\"));
            var routerDbRelativePath = configuration["Routing:RouterDbRelativePath"]
                ?? throw new InvalidOperationException("Routing:RouterDbRelativePath is missing in configuration.");
            var routerDbPath = Path.Combine(solutionRoot, routerDbRelativePath);

            // Optional: check if RouterDb exists
            if (!File.Exists(routerDbPath))
            {
                Console.WriteLine("RouterDb not found. Attempting to build it...");
                bool built = RouterDbHelper.BuildRouterDb();
                if (!built || !File.Exists(routerDbPath))
                    throw new InvalidOperationException($"Routing:RouterDb file could not be created at {routerDbPath}");
            }

            services.AddSingleton<ItineroRoutingService>(sp =>
                new ItineroRoutingService(routerDbPath, sp.GetRequiredService<ILogger<ItineroRoutingService>>()));

            return services;
        }
    }
}
