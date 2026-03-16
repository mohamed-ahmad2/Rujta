using Rujta.Application.Interfaces.InterfaceServices.IPharmacy;

namespace Rujta.Application.Services.Pharmcy
{
    public class PharmacyCartService : IPharmacyCartService
    {
        private readonly IPharmacySearchService _pharmacySearchService;
        private readonly ILogger<PharmacyCartService> _logger;

        public PharmacyCartService(
            IPharmacySearchService pharmacySearchService,
            ILogger<PharmacyCartService> logger)
        {
            _pharmacySearchService = pharmacySearchService;
            _logger = logger;
        }

        public async Task<List<PharmacyMatchResultDto>> GetTopPharmaciesForCartAsync(
            ItemDto order,
            double userLat,
            double userLng,
            int topK)
        {
            if (order == null || order.Items == null || !order.Items.Any())
            {
                _logger.LogWarning("Cart search called with empty order");
                return new List<PharmacyMatchResultDto>();
            }

            _logger.LogInformation(
                "Searching pharmacies for cart | UserLocation: {Lat},{Lng} | Items: {Count}",
                userLat,
                userLng,
                order.Items.Count
            );

            var result = await _pharmacySearchService.GetRankedPharmaciesAsync(
                order,
                userLat,
                userLng,
                topK
            );

            _logger.LogInformation("Cart pharmacy search returned {Count} results", result.Count);

            return result;
        }
    }
}