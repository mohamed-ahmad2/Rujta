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

            if (!IsValidOrder(order))
                return new List<PharmacyMatchResultDto>();

            var nearestPharmacies = await GetNearestPharmaciesSafe(userLat, userLng, topK);
            if (!nearestPharmacies.Any())
                return new List<PharmacyMatchResultDto>();

            var results = new List<PharmacyMatchResultDto>();

            foreach (var entry in nearestPharmacies)
            {
                var pharmacyResult = await ProcessPharmacyAsync(entry, order);

                if (pharmacyResult.MatchedDrugs > 0)
                {
                    results.Add(pharmacyResult);
                }
            }


            var finalResults = results
                .OrderByDescending(r => r.MatchedDrugs)
                .ThenBy(r => r.DistanceKm)
                .Take(topK)
                .ToList();

            LogFinalResults(finalResults);

            return finalResults;
        }


        private bool IsValidOrder(ItemDto order)
        {
            if (order == null)
            {
                _logger.LogWarning("Order is null");
                return false;
            }

            if (order.Items == null || !order.Items.Any())
            {
                _logger.LogWarning("Order items are null or empty");
                return false;
            }

            _logger.LogInformation("Total requested items: {Count}", order.Items.Count);

            for (int i = 0; i < order.Items.Count; i++)
            {
                var item = order.Items[i];
                _logger.LogInformation(
                    "Order item {Index}: MedicineId={MedicineId}, Quantity={Quantity}",
                    i, item.MedicineId, item.Quantity);

                if (item.MedicineId == 0)
                {
                    _logger.LogError(
                        "MedicineId is 0 for item index {Index}. Check frontend / DTO mapping!", i);
                }
            }

            return true;
        }


        private async Task<List<(Pharmacy pharmacy, double distance, double durationMinutes)>>
    GetNearestPharmaciesSafe(double userLat, double userLng, int topK)

        {
            try
            {
                var rawNearest = await _distanceService
                    .GetNearestPharmaciesRouted(userLat, userLng, "car", topK);

                var result = rawNearest
                    .Select(r => (r.pharmacy, r.distanceMeters, r.durationMinutes))
                    .ToList();

                _logger.LogInformation("Found {Count} nearest pharmacies", result.Count);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting nearest pharmacies from DistanceService");
                // Return an empty list with the correct tuple type
                return new List<(Pharmacy pharmacy, double distance, double durationMinutes)>();
            }
        }


        private async Task<PharmacyMatchResultDto> ProcessPharmacyAsync(
    (Pharmacy pharmacy, double distance, double durationMinutes) entry,
    ItemDto order)

        {
            var pharmacy = entry.pharmacy;
            var distance = entry.distance;
            var duration = entry.durationMinutes;

            int matched = 0;

            _logger.LogInformation(
                "=== Processing PharmacyId={PharmacyId}, Name={PharmacyName}, Distance={Distance}m ===",
                pharmacy.Id, pharmacy.Name, distance);

            foreach (var item in order.Items)
            {
                matched += await CheckMedicineStockAsync(pharmacy.Id, item);
            }

            _logger.LogInformation(
                "PharmacyId={PharmacyId} matched {Matched}/{TotalRequested} items",
                pharmacy.Id, matched, order.Items.Count);

            return new PharmacyMatchResultDto
            {
                PharmacyId = pharmacy.Id,
                Name = pharmacy.Name,
                Latitude = pharmacy.Latitude,
                Longitude = pharmacy.Longitude,
                ContactNumber = pharmacy.ContactNumber,
                MatchedDrugs = matched,
                TotalRequestedDrugs = order.Items.Count,
                DistanceKm = distance,
                EstimatedDurationMinutes = Math.Round(duration, 1),
                MatchPercentage = order.Items.Count > 0
        ? Math.Round(((double)matched / order.Items.Count) * 100, 1)
        : 0
            };

        }

        private async Task<int> CheckMedicineStockAsync(int pharmacyId, CartItemDto item)
        {
            try
            {
                _logger.LogInformation(
                    "Checking stock for MedicineId={MedicineId}, Quantity={Quantity}",
                    item.MedicineId, item.Quantity);

                int stock = await _pharmacyRepo
                    .GetMedicineStockAsync(pharmacyId, item.MedicineId);

                _logger.LogInformation(
                    "Stock for MedicineId={MedicineId} in PharmacyId={PharmacyId}: {Stock}",
                    item.MedicineId, pharmacyId, stock);

                if (stock >= item.Quantity)
                    return 1;

                _logger.LogWarning(
                    "MedicineId={MedicineId} not enough stock. Needed {Needed}, Available {Available}",
                    item.MedicineId, item.Quantity, stock);

                if (stock == 0)
                {
                    _logger.LogWarning(
                        "MedicineId={MedicineId} stock is zero in PharmacyId={PharmacyId}. Possibly missing in InventoryItems table",
                        item.MedicineId, pharmacyId);
                }

                if (item.MedicineId == 0)
                {
                    _logger.LogError(
                        "MedicineId=0 detected for PharmacyId={PharmacyId}. Check database or DTO mapping!",
                        pharmacyId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed stock query PharmacyId={PharmacyId}, MedicineId={MedicineId}",
                    pharmacyId, item.MedicineId);
            }

            return 0;
        }


        private void LogFinalResults(List<PharmacyMatchResultDto> results)
        {
            _logger.LogInformation(
                "=== Returning {Count} ranked pharmacy results ===",
                results.Count);

            foreach (var r in results)
            {
                _logger.LogInformation(
                    "PharmacyId={PharmacyId}, Name={Name}, Matched={Matched}/{TotalRequested}, MatchPercentage={Percentage}%, Distance={DistanceKm}km",
                    r.PharmacyId,
                    r.Name,
                    r.MatchedDrugs,
                    r.TotalRequestedDrugs,
                    r.MatchPercentage,
                    r.DistanceKm);
            }
        }


    }
}
