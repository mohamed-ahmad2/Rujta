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
            _logger.LogInformation("=== Start GetRankedPharmaciesAsync ===");
            _logger.LogInformation("User location: Lat={Lat}, Lng={Lng}, topK={TopK}", userLat, userLng, topK);

            if (order == null)
            {
                _logger.LogWarning("Order is null");
                return new List<PharmacyMatchResultDto>();
            }

            if (order.Items == null || !order.Items.Any())
            {
                _logger.LogWarning("Order items are null or empty");
                return new List<PharmacyMatchResultDto>();
            }

            _logger.LogInformation("Total requested items: {Count}", order.Items.Count);
            for (int i = 0; i < order.Items.Count; i++)
            {
                var item = order.Items[i];
                _logger.LogInformation("Order item {Index}: MedicineId={MedicineId}, Quantity={Quantity}", i, item.MedicineId, item.Quantity);
                if (item.MedicineId == 0)
                {
                    _logger.LogError("MedicineId is 0 for item index {Index}. Check frontend / DTO mapping!", i);
                }
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

            var result = new List<PharmacyMatchResultDto>();
            int totalRequested = order.Items.Count;

            foreach (var entry in nearestPharmacyResults)
            {
                var pharmacy = entry.pharmacy;
                var distance = entry.distance;
                int matched = 0;

                _logger.LogInformation("=== Processing PharmacyId={PharmacyId}, Name={PharmacyName}, Distance={Distance}m ===", pharmacy.Id, pharmacy.Name, distance);

                foreach (var item in order.Items)
                {
                    try
                    {
                        _logger.LogInformation("Checking stock for MedicineId={MedicineId}, Quantity={Quantity}", item.MedicineId, item.Quantity);

                        int stock = await _pharmacyRepo.GetMedicineStockAsync(pharmacy.Id, item.MedicineId);
                        _logger.LogInformation("Stock for MedicineId={MedicineId} in PharmacyId={PharmacyId}: {Stock}", item.MedicineId, pharmacy.Id, stock);

                        if (stock >= item.Quantity)
                        {
                            matched++;
                            _logger.LogInformation("MedicineId={MedicineId} available. Matched count now {Matched}", item.MedicineId, matched);
                        }
                        else
                        {
                            _logger.LogWarning("MedicineId={MedicineId} not enough stock. Needed {Needed}, Available {Available}", item.MedicineId, item.Quantity, stock);
                            if (stock == 0)
                            {
                                _logger.LogWarning("MedicineId={MedicineId} stock is zero in PharmacyId={PharmacyId}. Possibly missing in InventoryItems table", item.MedicineId, pharmacy.Id);
                            }
                        }

                        if (item.MedicineId == 0)
                        {
                            _logger.LogError("MedicineId=0 detected for PharmacyId={PharmacyId}. Check database or DTO mapping!", pharmacy.Id);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed stock query PharmacyId={PharmacyId}, MedicineId={MedicineId}", pharmacy.Id, item.MedicineId);
                    }
                }

                _logger.LogInformation("PharmacyId={PharmacyId} matched {Matched}/{TotalRequested} items", pharmacy.Id, matched, totalRequested);

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
                    MatchPercentage = totalRequested > 0 ? Math.Round(((double)matched / totalRequested) * 100, 1) : 0,
                });
            }

            var finalResults = result
                .OrderByDescending(r => r.MatchedDrugs)
                .ThenBy(r => r.DistanceKm)
                .Take(topK)
                .ToList();

            _logger.LogInformation("=== Returning {Count} ranked pharmacy results ===", finalResults.Count);
            foreach (var r in finalResults)
            {
                _logger.LogInformation("PharmacyId={PharmacyId}, Name={Name}, Matched={Matched}/{TotalRequested}, MatchPercentage={Percentage}%, Distance={DistanceKm}km",
                    r.PharmacyId, r.Name, r.MatchedDrugs, r.TotalRequestedDrugs, r.MatchPercentage, r.DistanceKm);
            }

            return finalResults;
        }
    }
}
