using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

namespace Rujta.API
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);


            

            // Add services
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            Console.WriteLine("Current ConnectionString: " + builder.Configuration.GetConnectionString("DefaultConnection"));


            // Database
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection")
                )
            );


            // Identity
            builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
            {
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 8;
            })
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

            // Authorization Policies
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("IsPharmacyAdmin", policy =>
                    policy.RequireRole("PharmacyAdmin", "SuperAdmin"));
                options.AddPolicy("IsPharmacist", policy =>
                    policy.RequireRole("Pharmacist", "PharmacyAdmin", "SuperAdmin"));
                options.AddPolicy("SamePharmacy", policy =>
                    policy.Requirements.Add(new SamePharmacyRequirement()));
            });

            builder.Services.AddSingleton<IAuthorizationHandler, SamePharmacyHandler>();


            // JWT
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                var jwtSection = builder.Configuration.GetSection("JWT");

                
                var certPath = Path.Combine(AppContext.BaseDirectory, "Certificates", "jwt-cert.pfx");
                var certPassword = "MyStrongPassword123";

                var certificate = new X509Certificate2(certPath, certPassword);

                
                var rsa = certificate.GetRSAPublicKey();
                var publicKey = new RsaSecurityKey(rsa);

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSection["Issuer"],

                    ValidateAudience = true,
                    ValidAudience = jwtSection["Audience"],

                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,

                    
                    IssuerSigningKey = publicKey,

                    ClockSkew = TimeSpan.FromSeconds(30)
                };
            });



            var baseDirectory = AppDomain.CurrentDomain.BaseDirectory;
            var solutionRoot = Path.GetFullPath(Path.Combine(baseDirectory, @"..\..\..\..\"));

            var routerDbRelativePath = builder.Configuration["Routing:RouterDbRelativePath"]
                ?? throw new InvalidOperationException("Routing:RouterDbRelativePath is missing in configuration.");

            var routerDbPath = Path.Combine(solutionRoot, routerDbRelativePath);

            
            if (!File.Exists(routerDbPath))
            {
                Console.WriteLine("RouterDb not found. Attempting to build it...");
                bool built = RouterDbHelper.BuildRouterDb();

                if (!built || !File.Exists(routerDbPath))
                    throw new InvalidOperationException($"Routing:RouterDb file could not be created at {routerDbPath}");
            }

            builder.Services.AddSingleton<ItineroRoutingService>(sp =>
                new ItineroRoutingService(routerDbPath, sp.GetRequiredService<ILogger<ItineroRoutingService>>()));

            // Application Services
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<PharmacyDistanceService>();
            builder.Services.AddScoped<IPharmacyRepository, PharmacyRepo>();


            // Fluent Vaildation
            builder.Services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();
            builder.Services.AddFluentValidationAutoValidation();
            builder.Services.AddFluentValidationClientsideAdapters();


            // Mapper
            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            builder.Services.AddAutoMapper(typeof(MedicineProfile).Assembly);

            builder.Services.AddScoped<TokenService>();
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            builder.Services.AddScoped<IMedicineService, MedicineService>();
            builder.Services.AddScoped<IOrderService, OrderService>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();


            builder.Services.AddHttpClient<MedicineDataImportService>();

            // fetch react
            // fetch react
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp",
                    policy => policy.WithOrigins(
                                    "http://localhost:5173",
                                    "http://localhost:3000")
                                .AllowAnyHeader()
                                .AllowAnyMethod()
                                .AllowCredentials());
            });



            var app = builder.Build();


            // Middleware
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            
            app.UseHttpsRedirection();

            app.UseMiddleware<JwtCookieMiddleware>();

            app.UseCors("AllowReactApp");
            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            // Role seeding
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
