using Microsoft.Extensions.DependencyInjection;


namespace Rujta.Infrastructure.Extensions
{
    public static class DatabaseConfiguration
    {
        public static IServiceCollection AddCustomDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            Console.WriteLine("Current ConnectionString: " + connectionString);

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString)
            );

            return services;
        }
    }
}
