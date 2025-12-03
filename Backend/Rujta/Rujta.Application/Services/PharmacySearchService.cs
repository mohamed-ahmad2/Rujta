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

        public async Task<List<PharmacyMatchResultDto>> GetRankedPharmaciesAsync(
    ItemDto order,
    double userLat,
    double userLng,
    int topK)
        {
            _logger.LogInformation("Starting GetRankedPharmaciesAsync for user at ({Lat}, {Lng}) with topK={TopK}", userLat, userLng, topK);

            if (order == null || order.Items == null || !order.Items.Any())
            {
                _logger.LogWarning("Order is empty or null");
                return new List<PharmacyMatchResultDto>();
            }

            List<(Pharmacy pharmacy, double distance)> nearestPharmacyResults;
            try
            {
                var rawNearest = await _distanceService.GetNearestPharmaciesRouted(userLat, userLng, "car", topK);

                nearestPharmacyResults = rawNearest
                    .Select(r => (r.pharmacy, r.distanceMeters))
                    .ToList();

                _logger.LogInformation("Found {Count} nearest pharmacies", nearestPharmacyResults.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting nearest pharmacies from DistanceService");
                return new List<PharmacyMatchResultDto>();
            }

            int totalRequested = order.Items.Count;
            var result = new List<PharmacyMatchResultDto>();

            foreach (var entry in nearestPharmacyResults)
            {
                var pharmacy = entry.pharmacy;
                var distance = entry.distance;
                int matched = 0;

                foreach (var item in order.Items)
                {
                    try
                    {
                        int stock = await _pharmacyRepo.GetMedicineStockAsync(pharmacy.Id, item.MedicineId);
                        if (stock >= item.Quantity)
                            matched++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed stock query PharmacyId={PharmacyId}, MedicineId={MedicineId}", pharmacy.Id, item.MedicineId);
                    }
                }

                result.Add(new PharmacyMatchResultDto
                {
                    PharmacyId = pharmacy.Id,
                    Name = pharmacy.Name,
                    Latitude = pharmacy.Latitude,
                    Longitude = pharmacy.Longitude,
                    ContactNumber = pharmacy.ContactNumber,
                    MatchedDrugs = matched,
                    TotalRequestedDrugs = totalRequested,
                    DistanceKm = distance,
                    MatchPercentage = Math.Round(((double)matched / totalRequested) * 100, 1),
                });

                _logger.LogDebug("Pharmacy {PharmacyName}: matched {Matched}/{TotalRequested}", pharmacy.Name, matched, totalRequested);
            }

            var finalResults = result
                .OrderByDescending(r => r.MatchedDrugs)
                .ThenBy(r => r.DistanceKm)
                .Take(topK)
                .ToList();

            _logger.LogInformation("Returning ranked pharmacy results: {Count}", finalResults.Count);
            return finalResults;
        }


    }
}
