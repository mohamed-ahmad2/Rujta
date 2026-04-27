using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Rujta.Application.Interfaces;

namespace Rujta.Infrastructure.BackgroundJobs
{
    public class AdExpiryService : BackgroundService
    {
        private readonly ILogger<AdExpiryService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public AdExpiryService(ILogger<AdExpiryService> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                try
                {
                    var now = DateTime.UtcNow;

                    var expiredAds = await unitOfWork.Ads.GetExpiredActiveAdsAsync(now);

                    _logger.LogInformation("Found {Count} expired ads to deactivate at {Time}", expiredAds.Count, now);

                    if (expiredAds.Any())
                    {
                        foreach (var ad in expiredAds)
                        {
                            ad.IsActive = false;
                            ad.UpdatedAt = DateTime.UtcNow;
                        }

                        await unitOfWork.SaveAsync();

                        _logger.LogInformation("Deactivated {Count} expired ads", expiredAds.Count);
                    }
                    else
                    {
                        _logger.LogInformation("No expired ads found at {Time}", now);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deactivating expired ads");
                }

                // Run every hour
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }
    }
}