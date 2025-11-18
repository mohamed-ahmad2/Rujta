using Microsoft.Extensions.Hosting;


namespace Rujta.Infrastructure.BackgroundJobs
{
    public class RefreshTokenCleanupService : BackgroundService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<RefreshTokenCleanupService> _logger;

        public RefreshTokenCleanupService(IUnitOfWork unitOfWork, ILogger<RefreshTokenCleanupService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.UtcNow;
                try
                {
                    var toRemove = await _unitOfWork.RefreshTokens.GetExpiredOrRevokedAsync(now);

                    if (toRemove.Any())
                    {
                        _unitOfWork.RefreshTokens.RemoveRange(toRemove);
                        await _unitOfWork.SaveAsync();
                        _logger.LogInformation("Cleaned up {Count} expired/revoked refresh tokens", toRemove.Count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error cleaning up refresh tokens");
                }

                var nextRunTime = DateTime.UtcNow.Date.AddDays(1).AddHours(3); 
                var delay = nextRunTime - now;
                if (delay < TimeSpan.Zero) delay = TimeSpan.Zero;

                await Task.Delay(delay, stoppingToken);

            }
        }
    }

}
