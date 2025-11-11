using Microsoft.AspNetCore.Authorization;
using Rujta.Infrastructure.Extensions;

namespace Rujta.API
{
    public static class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services Swagger
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

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
            builder.Services.AddApplicationServices();

            var app = builder.Build();


            
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Middleware
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
