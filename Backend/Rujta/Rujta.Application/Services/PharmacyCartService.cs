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
        private readonly IPharmacyRepository _pharmacyRepo;
        private readonly PharmacyDistanceService _distanceService;

        public PharmacyCartService(IPharmacyRepository pharmacyRepo, PharmacyDistanceService distanceService)
        {
            _pharmacyRepo = pharmacyRepo;
            _distanceService = distanceService;
        }

        public async Task<List<Pharmacy>> GetTopPharmaciesForCartAsync(ItemDto order, double userLat, double userLng, int topK)
        {
            // Step 1: Get top K nearest pharmacies
            var nearestPharmacyResults = await _distanceService.GetNearestPharmaciesRouted(userLat, userLng, "car", topK);
            var nearestPharmacies = nearestPharmacyResults.Select(r => r.pharmacy).ToList();

            // Step 2: Count how many requested items each pharmacy can satisfy
            var pharmacyCoverage = new Dictionary<Pharmacy, int>();

            foreach (var pharmacy in nearestPharmacies)
            {
                int availableCount = 0;

                foreach (var item in order.Items)
                {
                    // Check stock from InventoryItem
                    int stock = await _pharmacyRepo.GetMedicineStockAsync(pharmacy.Id, item.MedicineId);
                    if (stock >= item.Quantity)
                        availableCount++;
                }

                pharmacyCoverage[pharmacy] = availableCount;
            }

            // Step 3: Sort pharmacies by number of available items (descending)
            var sortedPharmacies = pharmacyCoverage
                .OrderByDescending(p => p.Value)
                .Select(p => p.Key)
                .ToList();

            return sortedPharmacies;
        }
    }
}
