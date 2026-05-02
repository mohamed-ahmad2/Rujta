using Microsoft.Extensions.Hosting;

namespace Rujta.Infrastructure.BackgroundJobs
{
    public class RefreshTokenCleanupService : BackgroundService
    {
        private readonly ILogger<RefreshTokenCleanupService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        private static readonly TimeZoneInfo EgyptTimeZone =
            TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

        public RefreshTokenCleanupService(ILogger<RefreshTokenCleanupService> logger,IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await using var scope = _scopeFactory.CreateAsyncScope();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                    var now = DateTime.UtcNow;
                    var toRemove = await unitOfWork.RefreshTokens.GetExpiredOrRevokedAsync(now);

                    _logger.LogInformation(
                        "Found {Count} tokens to remove at {Time}",
                        toRemove.Count, now);

                    if (toRemove.Count != 0)
                    {
                        unitOfWork.RefreshTokens.RemoveRange(toRemove);
                        await unitOfWork.SaveAsync();

                        _logger.LogInformation(
                            "Cleaned up {Count} expired/revoked refresh tokens",
                            toRemove.Count);
                    }
                    else
                    {
                        _logger.LogInformation(
                            "No expired/revoked refresh tokens found at {Time}", now);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error cleaning up refresh tokens");
                }

                var delay = CalculateDelayUntilNextRun();

                _logger.LogInformation(
                    "Next cleanup scheduled in {Delay:hh\\:mm\\:ss}", delay);

                await Task.Delay(delay, stoppingToken);
            }
        }

        private static TimeSpan CalculateDelayUntilNextRun()
        {
            var localTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, EgyptTimeZone);
            var nextRunTime = localTime.Date.AddDays(1).AddHours(3);
            var delay = nextRunTime - localTime;

            return delay < TimeSpan.Zero ? TimeSpan.Zero : delay;
        }
    }
}