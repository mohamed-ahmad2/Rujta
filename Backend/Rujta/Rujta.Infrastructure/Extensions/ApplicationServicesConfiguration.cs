using Rujta.Application.Notifications;
using Rujta.Application.Resolver;

namespace Rujta.Infrastructure.Extensions
{
    public static class ApplicationServicesConfiguration
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services
                .AddCoreInfrastructure()
                .AddRepositories()
                .AddDomainServices()
                .AddBackgroundServices()
                .AddHttpClients()
                .AddSingletonServices()
                .AddAuthContexts()
                .AddGeoServices()    
                .AddCaching();

            return services;
        }

        //Core Infrastructure
        private static IServiceCollection AddCoreInfrastructure(
            this IServiceCollection services)
        {
            services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(
                    typeof(ApplicationServicesConfiguration).Assembly, 
                    typeof(MedicineService).Assembly                   
                );
            });

            services.AddSignalR()
    .AddJsonProtocol(options =>
    {
        options.PayloadSerializerOptions.PropertyNamingPolicy = null;
    });

            services.AddHttpContextAccessor();

            return services;
        }

        //Repositories
        private static IServiceCollection AddRepositories(
            this IServiceCollection services)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IMedicineRepository, MedicineRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPharmacyRepository, PharmacyRepo>();
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();
            services.AddScoped<IAdRepository, AdRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<ILogRepository, LogRepository>();

            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
            services.AddScoped<IDiscountRepository, DiscountRepository>();
            services.AddScoped<IDeviceRepository, DeviceRepository>();

            services.AddScoped<IAddressRepository, AddressRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<ICompanyRepository, CompanyRepository>();
            services.AddScoped<ICustomerRepository, CustomerRepository>();
            services.AddScoped<IInventoryRepository, InventoryRepository>();
            services.AddScoped<IPeopleRepository, PeopleRepository>();
            services.AddScoped<IPharmacistRepository, PharmacistRepository>();
            services.AddScoped<IReportRepository, ReportRepository>();
            services.AddScoped<ISuperAdminRepository, SuperAdminRepository>();

            return services;
        }

        //Domain / Application Services
        private static IServiceCollection AddDomainServices(
            this IServiceCollection services)
        {
            services.AddScoped<TokenService>();
            services.AddScoped<TokenHelper>();
            services.AddScoped<IdentityServices>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ILogService, LogService>();
            
            services.AddScoped<IMedicineService, MedicineService>();
            services.AddScoped<ISearchMedicineService, SearchMedicineService>();
            services.AddScoped<IInventoryItemService, InventoryItemService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ICompanyService, CompanyService>();

            services.AddScoped<IPharmacyDistanceService, PharmacyDistanceService>();
            services.AddScoped<IPharmacyService, PharmacyService>();
            services.AddScoped<IPharmacySearchService, PharmacySearchService>();
            services.AddScoped<IPharmacyCartService, PharmacyCartService>();
            services.AddScoped<IPharmacistManagementService, PharmacistManagementService>();


            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IDiscountService, DiscountService>();

            services.AddScoped<INotificationService, NotificationService>();

            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IAddressService, AddressService>();

            services.AddScoped<IEmailService, EmailService>();

            services.AddScoped<IPrescriptionService, PrescriptionService>();
            services.AddScoped<IAdService, AdService>();
            services.AddScoped<IAdRepository, AdRepository>();
            services.AddMemoryCache();
            services.AddScoped<IDrugRequestRepository, DrugRequestRepository>();
            services.AddScoped<IDrugRequestService, DrugRequestService>();

            return services;
        }

        //Background Services
        private static IServiceCollection AddBackgroundServices(
            this IServiceCollection services)
        {
            services.AddHostedService<RefreshTokenCleanupService>();
            services.AddHostedService<AdExpiryService>();
            services.AddHostedService<DiscountExpirationService>();
            services.AddHostedService<SubscriptionExpirationService>();

            return services;
        }

        //HttpClients
        private static IServiceCollection AddHttpClients(
            this IServiceCollection services)
        {
            services.AddHttpClient<IGeocodingService, GeocodingService>();
            services.AddHttpClient<IPaymentService, PaymentService>();
            services.AddHttpClient<MedicineDataImportService>();

            return services;
        }

        //Singletons
        private static IServiceCollection AddSingletonServices(
            this IServiceCollection services)
        {
            services.AddSingleton<IMedicineAutocompleteIndex, MedicineAutocompleteIndex>();
            services.AddSingleton<IUserPresenceService, InMemoryUserPresenceService>();


            return services;
        }


        //Auth Contexts
        private static IServiceCollection AddAuthContexts(
            this IServiceCollection services)
        {
            services.AddScoped<AuthIdentityContext>(sp => new AuthIdentityContext(
                sp.GetRequiredService<IdentityServices>(),
                sp.GetRequiredService<IUnitOfWork>(),
                sp.GetRequiredService<IMapper>()
            ));

            services.AddScoped<AuthInfrastructureContext>(sp => new AuthInfrastructureContext(
                sp.GetRequiredService<ILogger<AuthInfrastructureContext>>(),
                sp.GetRequiredService<IHttpContextAccessor>(),
                sp.GetRequiredService<IConfiguration>(),  
                sp.GetRequiredService<IEmailService>()
            ));

            return services;
        }

        //Geo & Routing Services
        private static IServiceCollection AddGeoServices(
            this IServiceCollection services)
        {
            var mapsBasePath = Path.Combine(AppContext.BaseDirectory, "Maps");
            var pbfPath = Path.Combine(mapsBasePath, "egypt-251026.osm.pbf");
            var routerDbPath = Path.Combine(mapsBasePath, "egypt.routerdb");

            services.AddScoped<IAddressResolver, AddressResolver>();

            services.AddSingleton<IOfflineGeocodingService>(sp =>
            {
                var logger = sp.GetRequiredService<ILogger<OfflineGeocodingService>>();

                if (!File.Exists(pbfPath))
                {
                    logger.LogError("PBF file not found at {Path}", pbfPath);
                    throw new FileNotFoundException($"PBF file not found at: {pbfPath}");
                }

                var httpClientFactory = sp.GetRequiredService<IHttpClientFactory>();
                var onlineGeocoding = new GeocodingService(httpClientFactory.CreateClient());

                return new OfflineGeocodingService(pbfPath, onlineGeocoding, logger);
            });

            services.AddSingleton<ItineroRoutingService>(sp =>
            {
                var logger = sp.GetRequiredService<ILogger<ItineroRoutingService>>();

                EnsureRouterDbExists(routerDbPath, logger);

                return new ItineroRoutingService(routerDbPath, logger);
            });

            return services;
        }

        // Caching
        private static IServiceCollection AddCaching(
            this IServiceCollection services)
        {
            services.AddMemoryCache();

            return services;
        }

        private static void EnsureRouterDbExists(string routerDbPath, ILogger logger)
        {
            if (File.Exists(routerDbPath))
                return;

            logger.LogWarning(
                "RouterDb not found at {Path}. Attempting to build...",
                routerDbPath);

            var built = RouterDbHelper.BuildRouterDb();

            if (!built || !File.Exists(routerDbPath))
                throw new InvalidOperationException(
                    $"RouterDb could not be created at: {routerDbPath}");

            logger.LogInformation("RouterDb built successfully at {Path}", routerDbPath);
        }
    }
}