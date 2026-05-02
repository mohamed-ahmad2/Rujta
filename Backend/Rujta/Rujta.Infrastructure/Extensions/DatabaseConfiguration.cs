namespace Rujta.Infrastructure.Extensions
{
    public static class DatabaseConfiguration
    {
        public static IServiceCollection AddCustomDatabase(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "Connection string 'DefaultConnection' not found in configuration.");

            var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD")
                ?? throw new InvalidOperationException(
                    "DB_PASSWORD environment variable is not set.");

            connectionString = connectionString.Replace("{DB_PASSWORD}", dbPassword);

            Console.WriteLine(connectionString);

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                   
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(10),
                        errorNumbersToAdd: null
                    );

                    
                    sqlOptions.CommandTimeout(60);
                });
            });

            return services;
        }
    }
}