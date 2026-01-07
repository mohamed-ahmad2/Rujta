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
        private readonly IMedicineRepository _medicineRepo;
        private readonly ILogger<PharmacySearchService> _logger;

        public PharmacySearchService(
            IPharmacyRepository pharmacyRepo,
            PharmacyDistanceService distanceService,
            IMedicineRepository medicineRepo,
            ILogger<PharmacySearchService> logger)
        {
            _pharmacyRepo = pharmacyRepo;
            _distanceService = distanceService;
            _medicineRepo = medicineRepo;
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

            // Preload medicine names
            var medicineIds = order.Items.Select(i => i.MedicineId).Distinct().ToList();
            var medicines = await _medicineRepo.FindAsync(m => medicineIds.Contains(m.Id));
            var medicineNames = medicines.ToDictionary(m => m.Id, m => m.Name ?? "Unknown");

            var nearestPharmacies = await GetNearestPharmaciesSafe(userLat, userLng, topK);
            if (!nearestPharmacies.Any())
                return new List<PharmacyMatchResultDto>();

            var results = new List<PharmacyMatchResultDto>();

            foreach (var entry in nearestPharmacies)
            {
                var pharmacyResult = await ProcessPharmacyAsync(entry, order, medicineNames);

                if (pharmacyResult.MatchedDrugs > 0)
                    results.Add(pharmacyResult);
            }

            var finalResults = results
                .OrderByDescending(r => r.MatchedDrugs)
                .ThenBy(r => r.DistanceKm)
                .Take(topK)
                .ToList();

            LogFinalResults(finalResults);

            return finalResults;
        }

        #region Helpers

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
                LogOrderItem(order.Items[i], i);
            }

            return true;
        }

        private async Task<List<(Pharmacy pharmacy, double distanceMeters, double durationMinutes)>> GetNearestPharmaciesSafe(
            double userLat, double userLng, int topK)
        {
            try
            {
                return await _distanceService.GetNearestPharmaciesRouted(userLat, userLng, "car", topK * 2);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Routing failed, fallback to Haversine");
                var allPharmacies = await _pharmacyRepo.GetAllPharmacies();
                return allPharmacies
                    .Select(p => (pharmacy: p, distanceMeters: HaversineDistance(userLat, userLng, p.Latitude, p.Longitude), durationMinutes: 0.0))
                    .OrderBy(x => x.distanceMeters)
                    .Take(topK * 2)
                    .ToList();
            }
        }

        private static double HaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000; // meters
            double dLat = (lat2 - lat1) * Math.PI / 180.0;
            double dLon = (lon2 - lon1) * Math.PI / 180.0;

            double a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180.0) *
                Math.Cos(lat2 * Math.PI / 180.0) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            return 2 * R * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }

        private async Task<PharmacyMatchResultDto> ProcessPharmacyAsync(
            (Pharmacy pharmacy, double distanceMeters, double durationMinutes) entry,
            ItemDto order,
            Dictionary<int, string> medicineNames)
        {
            var pharmacy = entry.pharmacy;
            double distanceKm = entry.distanceMeters / 1000.0;
            double estimatedDurationMinutes = entry.durationMinutes;

            _logger.LogInformation(
                "Processing PharmacyId={PharmacyId}, Name={Name}, ApproxDistance={DistanceKm}km",
                pharmacy.Id, pharmacy.Name, distanceKm);

            int matched = 0;
            var foundMedicines = new List<FoundMedicineDto>();
            var notFoundMedicines = new List<NotFoundMedicineDto>();

            foreach (var item in order.Items)
            {
                var (stock, isEnough) = await CheckMedicineStockAsync(pharmacy.Id, item);

                string name = medicineNames.GetValueOrDefault(item.MedicineId, "Unknown");

                if (stock > 0)
                {
                    if (isEnough) matched++;

                    foundMedicines.Add(new FoundMedicineDto
                    {
                        MedicineId = item.MedicineId,
                        MedicineName = name,
                        RequestedQuantity = item.Quantity,
                        AvailableQuantity = stock,
                    });
                }
                else
                {
                    notFoundMedicines.Add(new NotFoundMedicineDto
                    {
                        MedicineId = item.MedicineId,
                        MedicineName = name,
                        RequestedQuantity = item.Quantity
                    });
                }
            }

            return new PharmacyMatchResultDto
            {
                PharmacyId = pharmacy.Id,
                Name = pharmacy.Name,
                Latitude = pharmacy.Latitude,
                Longitude = pharmacy.Longitude,
                ContactNumber = pharmacy.ContactNumber ?? string.Empty,

                MatchedDrugs = matched,
                TotalRequestedDrugs = order.Items.Count,
                MatchPercentage = order.Items.Count > 0
                    ? Math.Round(((double)matched / order.Items.Count) * 100, 1)
                    : 0,

                DistanceKm = distanceKm,
                EstimatedDurationMinutes = Math.Round(estimatedDurationMinutes, 1),

                FoundMedicines = foundMedicines,
                NotFoundMedicines = notFoundMedicines
            };
        }

        private async Task<(int stock, bool isEnough)> CheckMedicineStockAsync(int pharmacyId, CartItemDto item)
        {
            try
            {
                _logger.LogInformation("Checking stock for MedicineId={MedicineId}, Quantity={Quantity}", item.MedicineId, item.Quantity);

                int stock = await _pharmacyRepo.GetMedicineStockAsync(pharmacyId, item.MedicineId);
                bool isEnough = stock >= item.Quantity;

                LogStockCheck(pharmacyId, item, stock, isEnough);

                if (item.MedicineId == 0)
                {
                    _logger.LogError("MedicineId=0 detected for PharmacyId={PharmacyId}. Check database or DTO mapping!", pharmacyId);
                }

                return (stock, isEnough);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed stock query PharmacyId={PharmacyId}, MedicineId={MedicineId}", pharmacyId, item.MedicineId);
                return (0, false);
            }
        }

        private void LogFinalResults(List<PharmacyMatchResultDto> results)
        {
            _logger.LogInformation("=== Returning {Count} ranked pharmacy results ===", results.Count);

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

        // Helper methods for logging
        private void LogOrderItem(CartItemDto item, int index)
        {
            _logger.LogInformation(
                "Order item {Index}: MedicineId={MedicineId}, Quantity={Quantity}",
                index, item.MedicineId, item.Quantity);
        }

        private void LogStockCheck(int pharmacyId, CartItemDto item, int stock, bool isEnough)
        {
            if (stock == 0)
            {
                _logger.LogWarning("MedicineId={MedicineId} stock is zero in PharmacyId={PharmacyId}. Possibly missing in InventoryItems table", item.MedicineId, pharmacyId);
            }
            else if (!isEnough)
            {
                _logger.LogWarning("MedicineId={MedicineId} not enough stock. Needed {Needed}, Available {Available}", item.MedicineId, item.Quantity, stock);
            }
        }

        #endregion
    }
}
