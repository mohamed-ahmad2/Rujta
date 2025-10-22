using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Rujta.Application.Validation;
using Rujta.Infrastructure.Data;
using Rujta.Infrastructure.Identity;
using Rujta.Infrastructure.Identity.Handlers;
using Rujta.Infrastructure.Identity.Helpers;
using Rujta.Infrastructure.Identity.Requirements;
using System.Text;

namespace Rujta.API
{

    public static class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var jwtSection = builder.Configuration.GetSection("JWT");

            // Add services
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Database
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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

            // JWT Authentication
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                var signingKey = Environment.GetEnvironmentVariable("JWT_SIGNING_KEY");

                if (string.IsNullOrEmpty(signingKey))
                    throw new InvalidOperationException("JWT SigningKey is missing in configuration.");

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtSection["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSection["Audience"],
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30)
                };
            });

            // Fluent Vaildation
            builder.Services.AddValidatorsFromAssemblyContaining<RegisterDTOValidator>();
            builder.Services.AddFluentValidationAutoValidation();
            builder.Services.AddFluentValidationClientsideAdapters();


            // Mapper
            builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            
            builder.Services.AddScoped<TokenService>();



            var app = builder.Build();

            // Middleware
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

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
