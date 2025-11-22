using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Rujta.Infrastructure.BackgroundJobs
{
    public class RefreshTokenCleanupService : BackgroundService
    {
        private readonly ILogger<RefreshTokenCleanupService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

    public RefreshTokenCleanupService(ILogger<RefreshTokenCleanupService> logger, IServiceScopeFactory scopeFactory)
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
                    var toRemove = await unitOfWork.RefreshTokens.GetExpiredOrRevokedAsync(now);
                    _logger.LogInformation("Found {Count} tokens to remove at {Time}", toRemove.Count, now);

                    if (toRemove.Any())
                    {
                        unitOfWork.RefreshTokens.RemoveRange(toRemove);
                        await unitOfWork.SaveAsync();
                        _logger.LogInformation("Cleaned up {Count} expired/revoked refresh tokens", toRemove.Count);
                    }
                    else
                    {
                        _logger.LogInformation("No expired/revoked refresh tokens found at {Time}", now);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error cleaning up refresh tokens");
                }

                // NOSONAR
                //await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

                var localTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time"));
                var nextRunTime = localTime.Date.AddDays(1).AddHours(3);
                var delay = nextRunTime - localTime;
                if (delay < TimeSpan.Zero) delay = TimeSpan.Zero;

                _logger.LogInformation("Next cleanup scheduled at {NextRunTime}", nextRunTime);

                await Task.Delay(delay, stoppingToken);

            }
        }
    }

}
