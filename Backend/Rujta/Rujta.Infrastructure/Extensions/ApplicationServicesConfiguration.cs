using Microsoft.AspNetCore.Http;
using Rujta.Infrastructure.Identity.Services.Auth;

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
            services.AddScoped<IMedicineRepository, MedicineRepository>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPharmacyRepository, PharmacyRepo>();
            services.AddScoped<PharmacyDistanceService>();
            services.AddScoped<IdentityServices>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ILogService, LogService>();
            services.AddHostedService<RefreshTokenCleanupService>();
            services.AddScoped<ISearchMedicineService, SearchMedicineService>();
            services.AddScoped<IPharmacySearchService, PharmacySearchService>();
            services.AddScoped<IPharmacyCartService, PharmacyCartService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IInventoryItemService, InventoryItemService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<IAddressService, AddressService>();
            services.AddScoped<IUserService, UserService>();
            services.AddHttpClient<IGeocodingService, GeocodingService>();
            services.AddScoped<IPharmacistManagementService, PharmacistManagementService>();
            


            services.AddMemoryCache();


            services.AddScoped<AuthIdentityContext>(sp =>
            {
                var identityServices = sp.GetRequiredService<IdentityServices>();
                var unitOfWork = sp.GetRequiredService<IUnitOfWork>();
                var mapper = sp.GetRequiredService<IMapper>();

                return new AuthIdentityContext(identityServices, unitOfWork, mapper);
            });

            services.AddScoped<AuthInfrastructureContext>(sp =>
            {
                var logger = sp.GetRequiredService<ILogger<AuthInfrastructureContext>>();
                var httpContextAccessor = sp.GetRequiredService<IHttpContextAccessor>();
                var configuration = sp.GetRequiredService<IConfiguration>();
                var emailService = sp.GetRequiredService<IEmailService>();

                return new AuthInfrastructureContext(logger, httpContextAccessor, configuration, emailService);
            });


            // HttpClient services
            services.AddHttpClient<MedicineDataImportService>();

            services.AddSingleton<IOfflineGeocodingService>(sp =>
            {
                var configuration = sp.GetRequiredService<IConfiguration>();
                var relativePath = configuration["Routing:PbfFilePath"]
                                   ?? throw new InvalidOperationException("Routing:PbfFilePath is missing in configuration.");

                var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
                var solutionRoot = Path.GetFullPath(Path.Combine(baseDirectory, @"..\..\..\..\")); // جذر المشروع
                var absolutePath = Path.Combine(solutionRoot, relativePath.Replace("/", Path.DirectorySeparatorChar.ToString()));

                if (!File.Exists(absolutePath))
                    throw new FileNotFoundException($"PBF file not found at {absolutePath}");

                return new OfflineGeocodingService(absolutePath);
            });




            var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            var solutionRoot = Path.GetFullPath(Path.Combine(baseDirectory, @"..\..\..\..\"));
            var routerDbRelativePath = configuration["Routing:RouterDbRelativePath"]
                ?? throw new InvalidOperationException("Routing:RouterDbRelativePath is missing in configuration.");
            var routerDbPath = Path.Combine(solutionRoot, routerDbRelativePath);

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
