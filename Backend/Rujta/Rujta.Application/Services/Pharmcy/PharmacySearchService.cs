using Rujta.Application.DTOs.MedicineDtos;
using Rujta.Application.DTOs.OrderDto;
using Rujta.Application.DTOs.PharmacyDto;
using Rujta.Application.Interfaces.InterfaceServices.IPharmacy;
using Rujta.Application.Services.Builders;
using Rujta.Application.Services.Logging;

namespace Rujta.Application.Services.Pharmcy
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
            PharmacySearchLogger.LogStart(_logger, userLat, userLng, topK);

            if (!IsValidOrder(order))
                return new();

            var medicineNames = await GetMedicineNamesAsync(order);

            var specificItems = order.Items.Where(i => i.PharmacyId.HasValue).ToList();
            var generalItems = order.Items.Where(i => !i.PharmacyId.HasValue).ToList();

            var (entryMap, itemsMap) = await BuildPharmacyMapsAsync(
                specificItems, generalItems, userLat, userLng, topK);

            var results = await BuildMatchResultsAsync(
                entryMap, itemsMap, medicineNames, order.MaxShortageRange);

            var final = RankResults(results, specificItems.Any(), generalItems.Any(), topK);

            PharmacySearchLogger.LogFinalResults(_logger, final.Count);

            return final;
        }

        private async Task<Dictionary<int, string>> GetMedicineNamesAsync(ItemDto order)
        {
            var medicineIds = order.Items.Select(i => i.MedicineId).Distinct().ToList();
            var medicines = await _medicineRepo.FindAsync(m => medicineIds.Contains(m.Id));
            return medicines.ToDictionary(m => m.Id, m => m.Name ?? "Unknown");
        }

        private async Task<(
            Dictionary<int, (Pharmacy pharmacy, double distanceMeters, double durationMinutes)> entryMap,
            Dictionary<int, List<CartItemDto>> itemsMap)>
            BuildPharmacyMapsAsync(
                List<CartItemDto> specificItems,
                List<CartItemDto> generalItems,
                double userLat, double userLng, int topK)
        {
            var entryMap = new Dictionary<int, (Pharmacy, double, double)>();
            var itemsMap = new Dictionary<int, List<CartItemDto>>();

            var specificPharmacyIds = specificItems
                .Select(i => i.PharmacyId!.Value)
                .Distinct()
                .ToList();

            if (specificPharmacyIds.Any())
                await PopulateSpecificPharmaciesAsync(
                    specificItems, specificPharmacyIds, userLat, userLng, entryMap, itemsMap);

            if (generalItems.Any())
                await PopulateGeneralPharmaciesAsync(
                    generalItems, specificPharmacyIds, userLat, userLng, topK, entryMap, itemsMap);

            return (entryMap, itemsMap);
        }

        private async Task PopulateSpecificPharmaciesAsync(
            List<CartItemDto> specificItems,
            List<int> specificPharmacyIds,
            double userLat, double userLng,
            Dictionary<int, (Pharmacy, double, double)> entryMap,
            Dictionary<int, List<CartItemDto>> itemsMap)
        {
            var entries = await GetSpecificPharmaciesWithDistance(
                specificPharmacyIds, userLat, userLng);

            foreach (var entry in entries)
            {
                entryMap[entry.pharmacy.Id] = entry;
                itemsMap[entry.pharmacy.Id] = specificItems
                    .Where(i => i.PharmacyId == entry.pharmacy.Id)
                    .ToList();
            }
        }

        private async Task PopulateGeneralPharmaciesAsync(
            List<CartItemDto> generalItems,
            List<int> specificPharmacyIds,
            double userLat, double userLng, int topK,
            Dictionary<int, (Pharmacy, double, double)> entryMap,
            Dictionary<int, List<CartItemDto>> itemsMap)
        {
            var nearestEntries = await GetNearestPharmaciesSafe(userLat, userLng, topK);

            foreach (var entry in nearestEntries)
            {
                if (!entryMap.ContainsKey(entry.pharmacy.Id))
                {
                    entryMap[entry.pharmacy.Id] = entry;
                    itemsMap[entry.pharmacy.Id] = new List<CartItemDto>();
                }

                itemsMap[entry.pharmacy.Id].AddRange(generalItems);
            }

            AddGeneralItemsToSpecificPharmacies(specificPharmacyIds, generalItems, itemsMap);
        }

        private static void AddGeneralItemsToSpecificPharmacies(
            List<int> specificPharmacyIds,
            List<CartItemDto> generalItems,
            Dictionary<int, List<CartItemDto>> itemsMap)
        {
            foreach (var id in specificPharmacyIds)
            {
                if (!itemsMap.ContainsKey(id)) continue;

                bool alreadyHasGeneralItems = itemsMap[id].Any(i => !i.PharmacyId.HasValue);
                if (!alreadyHasGeneralItems)
                    itemsMap[id].AddRange(generalItems);
            }
        }
        private async Task<List<PharmacyMatchResultDto>> BuildMatchResultsAsync(
            Dictionary<int, (Pharmacy pharmacy, double distanceMeters, double durationMinutes)> entryMap,
            Dictionary<int, List<CartItemDto>> itemsMap,
            Dictionary<int, string> medicineNames,
            int? maxShortageRange)
        {
            var results = new List<PharmacyMatchResultDto>();

            foreach (var (pharmacyId, entry) in entryMap)
            {
                var items = itemsMap.GetValueOrDefault(pharmacyId);
                if (items == null || !items.Any()) continue;

                var pharmacyOrder = new ItemDto { Items = items };
                var result = await ProcessPharmacyAsync(entry, pharmacyOrder, medicineNames);

                if (result.MatchedDrugs == 0 && result.PartialMatches == 0)
                    continue;

                if (maxShortageRange.HasValue && result.TotalShortage > maxShortageRange.Value)
                    continue;

                results.Add(result);
            }

            return results;
        }

        private static List<PharmacyMatchResultDto> RankResults(
            List<PharmacyMatchResultDto> results,
            bool hasSpecific,
            bool hasGeneral,
            int topK)
        {
            if (hasSpecific && !hasGeneral)
                return results
                    .OrderByDescending(r => r.MatchedDrugs)
                    .ThenByDescending(r => r.PartialMatches)
                    .ThenBy(r => r.TotalShortage)
                    .ToList();

            return results
                .OrderByDescending(r => r.MatchedDrugs)
                .ThenByDescending(r => r.PartialMatches)
                .ThenBy(r => r.TotalShortage)
                .ThenBy(r => r.DistanceKm)
                .Take(topK)
                .ToList();
        }

        private bool IsValidOrder(ItemDto order)
        {
            if (order?.Items == null || !order.Items.Any())
                return false;

            for (int i = 0; i < order.Items.Count; i++)
                PharmacySearchLogger.LogOrderItem(_logger, order.Items[i], i);

            return true;
        }

        private async Task<List<(Pharmacy pharmacy, double distanceMeters, double durationMinutes)>>
            GetSpecificPharmaciesWithDistance(List<int> pharmacyIds, double lat, double lng)
        {
            var pharmacies = await _pharmacyRepo.GetPharmaciesByIdsAsync(pharmacyIds);

            try
            {
                var allRouted = await _distanceService.GetNearestPharmaciesRouted(lat, lng, "car", 999);
                var routedMap = allRouted.ToDictionary(x => x.pharmacy.Id);

                return pharmacies.Select(p =>
                    routedMap.TryGetValue(p.Id, out var routed)
                        ? routed
                        : (p, Haversine(lat, lng, p.Latitude, p.Longitude), 0.0)
                ).ToList();
            }
            catch
            {
                return pharmacies
                    .Select(p => (p, Haversine(lat, lng, p.Latitude, p.Longitude), 0.0))
                    .ToList();
            }
        }

        private async Task<List<(Pharmacy pharmacy, double distanceMeters, double durationMinutes)>>
            GetNearestPharmaciesSafe(double lat, double lng, int topK)
        {
            try
            {
                return await _distanceService.GetNearestPharmaciesRouted(lat, lng, "car", topK * 2);
            }
            catch
            {
                var all = await _pharmacyRepo.GetAllPharmacies();
                return all
                    .Select(p => (p, Haversine(lat, lng, p.Latitude, p.Longitude), 0.0))
                    .OrderBy(x => x.Item2)
                    .Take(topK * 2)
                    .ToList();
            }
        }

        private async Task<PharmacyMatchResultDto> ProcessPharmacyAsync(
            (Pharmacy pharmacy, double distanceMeters, double durationMinutes) entry,
            ItemDto order,
            Dictionary<int, string> medicineNames)
        {
            var pharmacy = entry.pharmacy;
            var distanceKm = entry.distanceMeters / 1000;
            var deliveryFee = DeliveryPricingService.CalculateFee(distanceKm);

            PharmacySearchLogger.LogPharmacyProcessing(_logger, pharmacy.Id, pharmacy.Name, distanceKm);

            int matched = 0;
            int partialMatches = 0;
            int totalShortage = 0;

            var found = new List<FoundMedicineDto>();
            var notFound = new List<NotFoundMedicineDto>();

            foreach (var item in order.Items)
            {
                int stock = await _pharmacyRepo.GetMedicineStockAsync(pharmacy.Id, item.MedicineId);
                PharmacySearchLogger.LogStockCheck(_logger, pharmacy.Id, item, stock);

                var name = medicineNames.GetValueOrDefault(item.MedicineId, "Unknown");

                if (stock > 0)
                {
                    var foundItem = new FoundMedicineDto
                    {
                        MedicineId = item.MedicineId,
                        MedicineName = name,
                        RequestedQuantity = item.Quantity,
                        AvailableQuantity = stock
                    };

                    found.Add(foundItem);

                    if (foundItem.IsFullyAvailable)
                    {
                        matched++;
                    }
                    else
                    {
                        partialMatches++;
                        totalShortage += foundItem.ShortageQuantity;

                        _logger.LogInformation(
                            "Pharmacy {PharmacyId} | Medicine {MedicineId} | " +
                            "Requested: {Requested} | Available: {Available} | Shortage: {Shortage}",
                            pharmacy.Id, item.MedicineId,
                            item.Quantity, stock, foundItem.ShortageQuantity);
                    }
                }
                else
                {
                    notFound.Add(new NotFoundMedicineDto
                    {
                        MedicineId = item.MedicineId,
                        MedicineName = name,
                        RequestedQuantity = item.Quantity
                    });
                }
            }

            _logger.LogInformation(
                "Pharmacy {Id} | Distance: {Distance}km | DeliveryFee: {Fee} | " +
                "Matched: {Matched} | Partial: {Partial} | TotalShortage: {Shortage}",
                pharmacy.Id, distanceKm, deliveryFee, matched, partialMatches, totalShortage);

            return PharmacyMatchResultBuilder.Build(new PharmacyMatchResultParams
            {
                Pharmacy = pharmacy,
                Order = order,
                Matched = matched,
                PartialMatches = partialMatches,
                TotalShortage = totalShortage,
                DistanceKm = distanceKm,
                DurationMinutes = entry.durationMinutes,
                DeliveryFee = deliveryFee,
                Found = found,
                NotFound = notFound
            });
        }

        private static double Haversine(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000;
            double dLat = (lat2 - lat1) * Math.PI / 180;
            double dLon = (lon2 - lon1) * Math.PI / 180;

            double a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) *
                Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            return 2 * R * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }
    }
}