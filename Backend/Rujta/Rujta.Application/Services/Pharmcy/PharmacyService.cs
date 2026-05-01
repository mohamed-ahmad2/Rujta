using Microsoft.Extensions.Caching.Memory;
using Rujta.Application.DTOs.MedicineDtos;
using Rujta.Application.DTOs.PharmacyDtos;
using Rujta.Application.Interfaces.InterfaceServices.IPharmacy;

namespace Rujta.Application.Services.Pharmcy
{
    public class PharmacyService : IPharmacyService
    {
        private readonly IPharmacyRepository _pharmacyRepository;
        private readonly IPharmacyDistanceService _distanceService;
        private readonly IDiscountService _discountService;
        private readonly IMemoryCache _cache;
        private readonly ILogger<PharmacyService> _logger;
        private readonly IMapper _mapper;

        private const int CacheDurationMinutes = 5;
        private const string MedicinesCachePrefix = "Medicines_Pharmacy_";

        public PharmacyService(
            IPharmacyRepository pharmacyRepository,
            IPharmacyDistanceService distanceService,
            IDiscountService discountService,
            IMemoryCache cache,
            ILogger<PharmacyService> logger,
            IMapper mapper)
        {
            _pharmacyRepository = pharmacyRepository;
            _distanceService = distanceService;
            _discountService = discountService;
            _cache = cache;
            _logger = logger;
            _mapper = mapper;
        }

        public async Task<IEnumerable<PharmacyDto>> GetAllPharmaciesAsync(
            CancellationToken cancellationToken = default)
        {
            var pharmacies = await _pharmacyRepository
                .GetAllPharmacies(cancellationToken);

            return _mapper.Map<IEnumerable<PharmacyDto>>(pharmacies);
        }

        public async Task<IEnumerable<MedicineDto>> GetMedicinesByPharmacyAsync(
            int pharmacyId)
        {
            string cacheKey = $"{MedicinesCachePrefix}{pharmacyId}";

            if (_cache.TryGetValue<IEnumerable<MedicineDto>>(cacheKey, out var cached)
                && cached != null)
                return cached;

            var inventoryItems = await _pharmacyRepository
                .GetInventoryItemsWithMedicineByPharmacyAsync(pharmacyId);

            var uniqueItems = inventoryItems
                .DistinctBy(i => i.MedicineID)
                .ToList();

            var dtos = _mapper.Map<List<MedicineDto>>(
                uniqueItems.Select(i => i.Medicine!).ToList());

            for (int i = 0; i < dtos.Count; i++)
                await ApplyDiscountToDtoAsync(dtos[i], uniqueItems[i]);

            _cache.Set(cacheKey, dtos, TimeSpan.FromMinutes(CacheDurationMinutes));

            return dtos;
        }

        public async Task<MedicineStockDto?> GetMedicineStockAsync(
            int pharmacyId,
            int medicineId)
        {
            var exists = await _pharmacyRepository
                .PharmacyHasMedicineAsync(pharmacyId, medicineId);

            if (!exists) return null;

            var stock = await _pharmacyRepository
                .GetMedicineStockAsync(pharmacyId, medicineId);

            return new MedicineStockDto
            {
                PharmacyId = pharmacyId,
                MedicineId = medicineId,
                Stock = stock
            };
        }

        public async Task<IEnumerable<NearestPharmacyDto>> GetNearestPharmaciesRoutedAsync(
            double userLat,
            double userLon,
            string mode = "car",
            int topK = 5)
        {
            var results = await _distanceService
                .GetNearestPharmaciesRouted(userLat, userLon, mode, topK);

            return _mapper.Map<IEnumerable<NearestPharmacyDto>>(results);
        }

        private async Task ApplyDiscountToDtoAsync(MedicineDto dto, InventoryItem entity)
        {
            try
            {
                var bestDiscount = await _discountService.GetBestDiscountAsync(entity);

                if (bestDiscount is null)
                {
                    SetNoDiscount(dto, entity.Medicine!.Price);
                    return;
                }

                var originalPrice = entity.Medicine!.Price;
                var discountedPrice = CalculateDiscountedPrice(originalPrice, bestDiscount);

                dto.DiscountedPrice = discountedPrice;
                dto.HasDiscount = discountedPrice < originalPrice;
    
                dto.DiscountValue = bestDiscount.Value;
                dto.DiscountName = bestDiscount.Name;
                dto.DiscountType = bestDiscount.Type;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Failed to apply discount for Medicine {MedicineId} in Pharmacy {PharmacyId}",
                    entity.MedicineID, entity.PharmacyID);

                SetNoDiscount(dto, entity.Medicine!.Price);
            }
        }

        private static decimal CalculateDiscountedPrice(decimal originalPrice, Discount discount)
        {
            decimal discountedPrice;

            if (discount.Type == DiscountType.Percentage)
            {
                discountedPrice = originalPrice - (originalPrice * discount.Value / 100);
            }
            else
            {
                discountedPrice = originalPrice - discount.Value;
            }

            return Math.Max(discountedPrice, 0);
        }

        private static void SetNoDiscount(MedicineDto dto, decimal originalPrice)
        {
            dto.DiscountedPrice = originalPrice;
            dto.DiscountValue = 0;
            dto.HasDiscount = false;
            dto.DiscountName = null;
            dto.DiscountType = null;
        }
    }
}