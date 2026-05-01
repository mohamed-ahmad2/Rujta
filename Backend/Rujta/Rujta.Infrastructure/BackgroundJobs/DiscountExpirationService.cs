using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Hosting;

namespace Rujta.Infrastructure.BackgroundJobs
{
    public class DiscountExpirationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<DiscountExpirationService> _logger;

        
        private static readonly TimeSpan _interval = TimeSpan.FromMinutes(5);

        
        private static readonly TimeSpan _initialDelay = TimeSpan.FromSeconds(30);

        public DiscountExpirationService(
            IServiceProvider serviceProvider,
            ILogger<DiscountExpirationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "DiscountExpirationService started. Interval: {Interval}",
                _interval);

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
                    await DeactivateExpiredDiscountsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Error while deactivating expired discounts");
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

            _logger.LogInformation("DiscountExpirationService stopped");
        }

        private async Task DeactivateExpiredDiscountsAsync(CancellationToken ct)
        {
            using var scope = _serviceProvider.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var cache = scope.ServiceProvider.GetRequiredService<IMemoryCache>();

            var now = DateTime.UtcNow;

            var expired = await unitOfWork.Discount
                .GetExpiredActiveDiscountsAsync(now, ct);

            if (expired.Count == 0)
            {
                _logger.LogDebug("No expired discounts to deactivate");
                return;
            }

            var affectedPharmacies = new HashSet<int>();

            foreach (var discount in expired)
            {
                discount.IsActive = false;
              
                affectedPharmacies.Add(discount.PharmacyId);
            }

            await unitOfWork.SaveAsync(ct);

            foreach (var pharmacyId in affectedPharmacies)
            {
                cache.Remove($"InventoryItems_Pharmacy_{pharmacyId}");
                cache.Remove($"Medicines_Pharmacy_{pharmacyId}");
            }
            cache.Remove("InventoryItems_All");

            _logger.LogInformation(
                "Deactivated {Count} expired discount(s) across {PharmacyCount} pharmacy(ies)",
                expired.Count,
                affectedPharmacies.Count);
        }
    }
}