namespace Rujta.Infrastructure.Extensions
{
    public static class DatabaseConfiguration
    {
        public static IServiceCollection AddCustomDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found in configuration.");
            }

            var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
            if (string.IsNullOrEmpty(dbPassword))
            {
                throw new InvalidOperationException("DB_PASSWORD environment variable is not set.");
            }

            connectionString = connectionString.Replace("{DB_PASSWORD}", dbPassword);

            Console.WriteLine(connectionString);

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString)
            );

            return services;
        }
    }
}
