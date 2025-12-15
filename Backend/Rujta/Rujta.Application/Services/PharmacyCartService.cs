using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;

namespace Rujta.Application.Services
{
    public class PharmacyCartService : IPharmacyCartService
    {
        private readonly IPharmacySearchService _pharmacySearchService;

        public PharmacyCartService(IPharmacySearchService pharmacySearchService)
        {
            _pharmacySearchService = pharmacySearchService;
        }

        public async Task<List<PharmacyMatchResultDto>> GetTopPharmaciesForCartAsync(
            ItemDto order, double userLat, double userLng, int topK)
            => await _pharmacySearchService.GetRankedPharmaciesAsync(order, userLat, userLng, topK);
    }
}
