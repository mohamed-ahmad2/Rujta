using Microsoft.AspNetCore.Http;
using Rujta.Application.Interfaces.InterfaceServices.IAuth;
using Rujta.Application.Interfaces.InterfaceServices.IGeocoding;
using Rujta.Application.Interfaces.InterfaceServices.IMedicine;
using Rujta.Application.Interfaces.InterfaceServices.IOrder;
using Rujta.Application.Interfaces.InterfaceServices.IPharmacy;
using Rujta.Application.Services.Geocoding;
using Rujta.Application.Services.MedicineS;
using Rujta.Application.Services.OrderS;
using Rujta.Application.Services.Pharmcy;
using Rujta.Domain.Interfaces;
using Rujta.Infrastructure.Identity.Services.Auth;

namespace Rujta.Infrastructure.Extensions
{
    public static class ApplicationServicesConfiguration
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Mapper
            services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(AppDomain.CurrentDomain.GetAssemblies());
            });

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
            services.AddSingleton<IMedicineAutocompleteIndex, MedicineAutocompleteIndex>();
            //   services.AddHttpClient<IPaymobService, PaymobService>();
            services.AddScoped<IPrescriptionService, PrescriptionService>();
            services.AddSingleton<IUserPresenceService, InMemoryUserPresenceService>();
            services.AddScoped<IAdService, AdService>();
            services.AddScoped<IAdRepository, AdRepository>();
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


            var pbfPath = Path.Combine(AppContext.BaseDirectory, "Maps", "egypt-251026.osm.pbf");
            if (!File.Exists(pbfPath))
                throw new FileNotFoundException($"PBF file not found at {pbfPath}");

            services.AddSingleton<IOfflineGeocodingService>(sp =>
            {
                var onlineGeocoding = sp.GetRequiredService<IGeocodingService>();
                var logger = sp.GetRequiredService<ILogger<OfflineGeocodingService>>();

                return new OfflineGeocodingService(pbfPath, onlineGeocoding, logger);
            });


            var routerDbPath = Path.Combine(AppContext.BaseDirectory, "Maps", "egypt.routerdb");

            services.AddSingleton<ItineroRoutingService>(sp =>
            {
                var logger = sp.GetRequiredService<ILogger<ItineroRoutingService>>();

                if (!File.Exists(routerDbPath))
                {
                    logger.LogWarning("RouterDb not found at {Path}. Attempting to build it...", routerDbPath);

                    bool built = RouterDbHelper.BuildRouterDb();

                    if (!built || !File.Exists(routerDbPath))
                        throw new InvalidOperationException($"Routing: RouterDb file could not be created at {routerDbPath}");
                }

                return new ItineroRoutingService(routerDbPath, logger);
            });

            return services;
        }
    }
}