using Rujta.Application.Services.Builders;
using Rujta.Application.Services.Logging;

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
            PharmacySearchLogger.LogStart(_logger, userLat, userLng, topK);

            if (!IsValidOrder(order))
                return new();

            var medicineIds = order.Items.Select(i => i.MedicineId).Distinct().ToList();
            var medicines = await _medicineRepo.FindAsync(m => medicineIds.Contains(m.Id));
            var medicineNames = medicines.ToDictionary(m => m.Id, m => m.Name ?? "Unknown");

            var nearestPharmacies = await GetNearestPharmaciesSafe(userLat, userLng, topK);

            var results = new List<PharmacyMatchResultDto>();

            foreach (var entry in nearestPharmacies)
            {
                var result = await ProcessPharmacyAsync(entry, order, medicineNames);
                if (result.MatchedDrugs > 0)
                    results.Add(result);
            }

            var final = results
                .OrderByDescending(r => r.MatchedDrugs)
                .ThenBy(r => r.DistanceKm)
                .Take(topK)
                .ToList();

            PharmacySearchLogger.LogFinalResults(_logger, final.Count);

            return final;
        }

        private bool IsValidOrder(ItemDto order)
        {
            if (order?.Items == null || !order.Items.Any())
                return false;

            for (int i = 0; i < order.Items.Count; i++)
            {
                PharmacySearchLogger.LogOrderItem(_logger, order.Items[i], i);
            }

            return true;
        }

        private async Task<List<(Pharmacy pharmacy, double distanceMeters, double durationMinutes)>> GetNearestPharmaciesSafe(
            double lat, double lng, int topK)
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

            PharmacySearchLogger.LogPharmacyProcessing(
                _logger,
                pharmacy.Id,
                pharmacy.Name,
                distanceKm);

            int matched = 0;
            var found = new List<FoundMedicineDto>();
            var notFound = new List<NotFoundMedicineDto>();

            foreach (var item in order.Items)
            {
                int stock = await _pharmacyRepo.GetMedicineStockAsync(pharmacy.Id, item.MedicineId);
                PharmacySearchLogger.LogStockCheck(_logger, pharmacy.Id, item, stock);

                var name = medicineNames.GetValueOrDefault(item.MedicineId, "Unknown");

                if (stock > 0)
                {
                    if (stock >= item.Quantity) matched++;

                    found.Add(new FoundMedicineDto
                    {
                        MedicineId = item.MedicineId,
                        MedicineName = name,
                        RequestedQuantity = item.Quantity,
                        AvailableQuantity = stock
                    });
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

            return PharmacyMatchResultBuilder.Build(
                pharmacy,
                order,
                matched,
                distanceKm,
                entry.durationMinutes,
                found,
                notFound);
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
