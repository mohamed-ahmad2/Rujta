using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services
{
    public class PharmacySearchService : IPharmacySearchService
    {
        private readonly IPharmacyRepository _pharmacyRepo;
        private readonly PharmacyDistanceService _distanceService;
        private readonly ILogger<PharmacySearchService> _logger;

        public PharmacySearchService(
            IPharmacyRepository pharmacyRepo,
            PharmacyDistanceService distanceService,
            ILogger<PharmacySearchService> logger)
        {
            _pharmacyRepo = pharmacyRepo;
            _distanceService = distanceService;
            _logger = logger;
        }

        public async Task<List<Pharmacy>> GetRankedPharmaciesAsync(ItemDto order, double userLat, double userLng, int topK)
        {
            _logger.LogInformation("Starting GetRankedPharmaciesAsync for user at ({Lat}, {Lng}) with topK={TopK}", userLat, userLng, topK);

            if (order == null || order.Items == null || !order.Items.Any())
            {
                _logger.LogWarning("Order is empty or null");
                return new List<Pharmacy>();
            }

            List<Pharmacy> nearestPharmacies;
            try
            {
                var nearestPharmacyResults = await _distanceService.GetNearestPharmaciesRouted(userLat, userLng, "car", topK);
                nearestPharmacies = nearestPharmacyResults.Select(r => r.pharmacy).ToList();
                _logger.LogInformation("Found {Count} nearest pharmacies", nearestPharmacies.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting nearest pharmacies from DistanceService for location ({Lat}, {Lng})", userLat, userLng);
                return new List<Pharmacy>();
            }

            var pharmacyCoverage = new Dictionary<Pharmacy, int>();

            foreach (var pharmacy in nearestPharmacies)
            {
                int availableCount = 0;
                foreach (var item in order.Items)
                {
                    try
                    {
                        int stock = await _pharmacyRepo.GetMedicineStockAsync(pharmacy.Id, item.MedicineId);
                        if (stock >= item.Quantity)
                            availableCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get stock for PharmacyId={PharmacyId}, MedicineId={MedicineId}", pharmacy.Id, item.MedicineId);
                    }
                }
                pharmacyCoverage[pharmacy] = availableCount;
                _logger.LogDebug("Pharmacy {PharmacyName} covers {Count} items", pharmacy.Name, availableCount);
            }

            var sortedPharmacies = pharmacyCoverage
                .OrderByDescending(p => p.Value)
                .Select(p => p.Key)
                .ToList();

            _logger.LogInformation("Returning {Count} sorted pharmacies", sortedPharmacies.Count);

            return sortedPharmacies;
        }
    }
}
