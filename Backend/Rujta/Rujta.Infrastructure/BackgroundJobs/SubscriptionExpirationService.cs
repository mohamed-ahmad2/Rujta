using Microsoft.Extensions.Hosting;
using Rujta.Domain.Enums;

namespace Rujta.Infrastructure.BackgroundJobs
{
    public class SubscriptionExpirationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<SubscriptionExpirationService> _logger;

        private static readonly TimeSpan _interval = TimeSpan.FromHours(1);
        private static readonly TimeSpan _initialDelay = TimeSpan.FromSeconds(30);

        public SubscriptionExpirationService(
            IServiceProvider serviceProvider,
            ILogger<SubscriptionExpirationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "SubscriptionExpirationService started. Interval: {Interval}", _interval);

            try
            {
                await Task.Delay(_initialDelay, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                return;
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ExpireSubscriptionsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while expiring subscriptions");
                }

                try
                {
                    await Task.Delay(_interval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }

            _logger.LogInformation("SubscriptionExpirationService stopped");
        }

        private async Task ExpireSubscriptionsAsync(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

            var expired = await unitOfWork.Subscriptions.GetExpiredActiveSubscriptionsAsync(ct);

            if (expired.Count == 0)
            {
                _logger.LogDebug("No expired subscriptions found");
                return;
            }

            var affectedPharmacies = new HashSet<int>();

            foreach (var subscription in expired)
            {
                subscription.Status = SubscriptionStatus.Expired;

                if (subscription.Pharmacy is not null)
                    subscription.Pharmacy.IsActive = false;

                affectedPharmacies.Add(subscription.PharmacyId);
            }

            await unitOfWork.SaveAsync(ct);

            _logger.LogInformation(
                "Expired {Count} subscription(s) across {PharmacyCount} pharmacy(ies)",
                expired.Count,
                affectedPharmacies.Count);
        }
    }
}