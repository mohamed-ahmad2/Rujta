using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using Rujta.Application.DTOs.Common;
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
        private const int SlidingMinutes = 2;

        private const string MedicinesCachePrefix = "Medicines_Pharmacy_";
        private const string PagedMedicinesPrefix = "PagedMeds_Pharmacy_";
        private const string AllPharmaciesCacheKey = "Pharmacies_All";
        private const string StockCachePrefix = "Stock_";

 
        private static readonly Dictionary<int, CancellationTokenSource> _pharmacyCacheTokens = new();
        private static readonly object _tokenLock = new();


        private static CancellationTokenSource _allPharmaciesToken = new();

        public PharmacyService(IPharmacyRepository pharmacyRepository, IPharmacyDistanceService distanceService,IDiscountService discountService,IMemoryCache cache, ILogger<PharmacyService> logger,IMapper mapper)
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
            if (_cache.TryGetValue<IEnumerable<PharmacyDto>>(AllPharmaciesCacheKey, out var cached)
                && cached != null)
                return cached;

            var pharmacies = await _pharmacyRepository
                .GetAllPharmacies(cancellationToken);

            var result = _mapper.Map<IEnumerable<PharmacyDto>>(pharmacies);

            var options = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheDurationMinutes))
                .SetSlidingExpiration(TimeSpan.FromMinutes(SlidingMinutes))
                .AddExpirationToken(new CancellationChangeToken(_allPharmaciesToken.Token));

            _cache.Set(AllPharmaciesCacheKey, result, options);

            return result;
        }

        public async Task<IEnumerable<MedicineDto>> GetMedicinesByPharmacyAsync(int pharmacyId)
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

            var token = GetOrCreatePharmacyToken(pharmacyId);
            var options = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheDurationMinutes))
                .SetSlidingExpiration(TimeSpan.FromMinutes(SlidingMinutes))
                .AddExpirationToken(new CancellationChangeToken(token.Token));

            _cache.Set(cacheKey, dtos, options);

            return dtos;
        }

        public async Task<PagedResultDto<MedicineDto>> GetPagedMedicinesByPharmacyAsync(
            int pharmacyId,
            int pageNumber,
            int pageSize,
            string? searchTerm,
            int? categoryId,
            CancellationToken cancellationToken = default)
        {
         
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 16;
            if (pageSize > 100) pageSize = 100;

         
            string cacheKey = BuildPagedCacheKey(pharmacyId, pageNumber, pageSize, searchTerm, categoryId);

         
            if (_cache.TryGetValue<PagedResultDto<MedicineDto>>(cacheKey, out var cached)
                && cached != null)
            {
                _logger.LogDebug("Cache HIT for paged medicines: {Key}", cacheKey);
                return cached;
            }

            _logger.LogDebug("Cache MISS for paged medicines: {Key}", cacheKey);

        
            var (items, totalCount) = await _pharmacyRepository
                .GetPagedInventoryByPharmacyAsync(
                    pharmacyId, pageNumber, pageSize, searchTerm, categoryId, cancellationToken);

            
            var dtos = _mapper.Map<List<MedicineDto>>(
                items.Select(i => i.Medicine!).ToList());

            for (int i = 0; i < dtos.Count; i++)
                await ApplyDiscountToDtoAsync(dtos[i], items[i]);

           
            var result = new PagedResultDto<MedicineDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };

           
            var token = GetOrCreatePharmacyToken(pharmacyId);
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheDurationMinutes))
                .SetSlidingExpiration(TimeSpan.FromMinutes(SlidingMinutes))
                .AddExpirationToken(new CancellationChangeToken(token.Token));

            _cache.Set(cacheKey, result, cacheOptions);

            return result;
        }

        public async Task<MedicineStockDto?> GetMedicineStockAsync(
            int pharmacyId,
            int medicineId)
        {
            string cacheKey = $"{StockCachePrefix}{pharmacyId}_{medicineId}";

            if (_cache.TryGetValue<MedicineStockDto>(cacheKey, out var cached) && cached != null)
                return cached;

            var exists = await _pharmacyRepository
                .PharmacyHasMedicineAsync(pharmacyId, medicineId);

            if (!exists) return null;

            var stock = await _pharmacyRepository
                .GetMedicineStockAsync(pharmacyId, medicineId);

            var result = new MedicineStockDto
            {
                PharmacyId = pharmacyId,
                MedicineId = medicineId,
                Stock = stock
            };

    
            var token = GetOrCreatePharmacyToken(pharmacyId);
            var options = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(1)) 
                .AddExpirationToken(new CancellationChangeToken(token.Token));

            _cache.Set(cacheKey, result, options);

            return result;
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
        public static void InvalidatePharmacyCache(int pharmacyId)
        {
            lock (_tokenLock)
            {
                if (_pharmacyCacheTokens.TryGetValue(pharmacyId, out var token))
                {
                    token.Cancel();
                    token.Dispose();
                    _pharmacyCacheTokens.Remove(pharmacyId);
                }
            }
        }

        public static void InvalidateAllPharmaciesCache()
        {
            var oldToken = _allPharmaciesToken;
            _allPharmaciesToken = new CancellationTokenSource();
            oldToken.Cancel();
            oldToken.Dispose();
        }

        private static string BuildPagedCacheKey(
            int pharmacyId, int page, int size, string? search, int? categoryId)
        {
            return $"{PagedMedicinesPrefix}{pharmacyId}_p{page}_s{size}" +
                   $"_q{search ?? "_"}_c{categoryId?.ToString() ?? "_"}";
        }

        private static CancellationTokenSource GetOrCreatePharmacyToken(int pharmacyId)
        {
            lock (_tokenLock)
            {
                if (!_pharmacyCacheTokens.TryGetValue(pharmacyId, out var token)
                    || token.IsCancellationRequested)
                {
                    token = new CancellationTokenSource();
                    _pharmacyCacheTokens[pharmacyId] = token;
                }
                return token;
            }
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