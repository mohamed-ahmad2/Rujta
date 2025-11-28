using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Rujta.Application.Services
{
    public class PharmacyCartService : IPharmacyCartService
    {
        private readonly IPharmacySearchService _pharmacySearchService;

        public PharmacyCartService(IPharmacySearchService pharmacySearchService)
        {
            _pharmacySearchService = pharmacySearchService;
        }

        public async Task<List<Pharmacy>> GetTopPharmaciesForCartAsync(ItemDto order, double userLat, double userLng, int topK)=>
            await _pharmacySearchService.GetRankedPharmaciesAsync(order, userLat, userLng, topK);
    }
}
