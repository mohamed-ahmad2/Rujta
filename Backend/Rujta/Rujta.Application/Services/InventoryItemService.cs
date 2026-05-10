using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using Rujta.Application.DTOs.Common;
using Rujta.Application.DTOs.InventoryDto;
using Rujta.Application.Services.Pharmcy;

namespace Rujta.Application.Services
{
    public class InventoryItemService : IInventoryItemService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly IDiscountService _discountService;
        private readonly ILogger<InventoryItemService> _logger;

        private const int CacheDurationMinutes = 5;
        private const int SlidingMinutes = 2;

        private const string AllItemsCacheKey = "InventoryItems_All";
        private const string ItemByIdPrefix = "InventoryItem_";
        private const string ItemsByPharmacyPrefix = "InventoryItems_Pharmacy_";

        private static CancellationTokenSource _inventoryListToken = new();

        private static readonly Dictionary<int, CancellationTokenSource> _pharmacyInventoryTokens = new();
        private static readonly object _tokenLock = new();

        public InventoryItemService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IMemoryCache cache,
            IDiscountService discountService,
            ILogger<InventoryItemService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
            _discountService = discountService;
            _logger = logger;
        }

        public async Task<PagedResultDto<InventoryItemDto>> GetPagedAsync(
            int pharmacyId,
            InventoryItemFilterDto filter,
            CancellationToken cancellationToken = default)
        {
            try
            {
                filter ??= new InventoryItemFilterDto();

                string cacheKey = BuildCacheKey(pharmacyId, filter);

                if (_cache.TryGetValue<PagedResultDto<InventoryItemDto>>(cacheKey, out var cached)
                    && cached != null)
                {
                    _logger.LogDebug("Cache HIT: Inventory Paged");
                    return cached;
                }

                var query = _unitOfWork.InventoryItems
                    .GetQueryable()
                    .AsNoTracking()
                    .Where(i => i.PharmacyID == pharmacyId);

                // ✅ Free-text search against medicine name (case-insensitive)
                if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                {
                    var term = filter.SearchTerm.Trim().ToLower();
                    query = query.Where(i =>
                        i.Medicine != null &&
                        i.Medicine.Name.ToLower().Contains(term));
                }

                if (filter.MedicineId.HasValue)
                    query = query.Where(i => i.MedicineID == filter.MedicineId.Value);

                if (filter.CategoryId.HasValue)
                    query = query.Where(i => i.Medicine!.CategoryId == filter.CategoryId.Value);

                if (filter.Status.HasValue)
                    query = query.Where(i => i.Status == filter.Status.Value);

                var totalCount = await query.CountAsync(cancellationToken);

                var items = await query
                    .Include(i => i.Medicine)
                    .ThenInclude(m => m!.Category)
                    .OrderBy(i => i.Id)
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync(cancellationToken);

                foreach (var item in items)
                    UpdateProductStatus(item);

                var dtos = _mapper.Map<List<InventoryItemDto>>(items);

                for (int i = 0; i < dtos.Count; i++)
                    await ApplyDiscountToDtoAsync(dtos[i], items[i]);

                var result = new PagedResultDto<InventoryItemDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    PageNumber = filter.PageNumber,
                    PageSize = filter.PageSize
                };

                var options = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheDurationMinutes))
                    .SetSlidingExpiration(TimeSpan.FromMinutes(SlidingMinutes))
                    .AddExpirationToken(new CancellationChangeToken(_inventoryListToken.Token));

                _cache.Set(cacheKey, result, options);

                return result;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    "An error occurred while fetching paged inventory items.", ex);
            }
        }

        public async Task<IEnumerable<InventoryItemDto>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            if (_cache.TryGetValue<IEnumerable<InventoryItemDto>>(AllItemsCacheKey, out var cached)
                && cached != null)
            {
                _logger.LogDebug("Cache HIT: All inventory items");
                return cached;
            }

            var entities = await _unitOfWork.InventoryItems.GetAllAsync(cancellationToken);
            var entityList = entities.ToList();

            foreach (var item in entityList)
                UpdateProductStatus(item);

            var dtos = _mapper.Map<List<InventoryItemDto>>(entityList);

            for (int i = 0; i < dtos.Count; i++)
                await ApplyDiscountToDtoAsync(dtos[i], entityList[i]);

            var options = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheDurationMinutes))
                .SetSlidingExpiration(TimeSpan.FromMinutes(SlidingMinutes))
                .AddExpirationToken(new CancellationChangeToken(_inventoryListToken.Token));

            _cache.Set(AllItemsCacheKey, dtos, options);
            return dtos;
        }

        public async Task<InventoryItemDto?> GetByIdAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            string cacheKey = $"{ItemByIdPrefix}{id}";

            if (_cache.TryGetValue<InventoryItemDto>(cacheKey, out var cached) && cached != null)
            {
                _logger.LogDebug("Cache HIT: InventoryItem {Id}", id);
                return cached;
            }

            var entity = await _unitOfWork.InventoryItems.GetByIdAsync(id, cancellationToken);
            if (entity == null) return null;

            UpdateProductStatus(entity);

            var dto = _mapper.Map<InventoryItemDto>(entity);
            await ApplyDiscountToDtoAsync(dto, entity);

            var pharmacyToken = GetOrCreatePharmacyToken(entity.PharmacyID);
            var options = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheDurationMinutes))
                .SetSlidingExpiration(TimeSpan.FromMinutes(SlidingMinutes))
                .AddExpirationToken(new CancellationChangeToken(pharmacyToken.Token))
                .AddExpirationToken(new CancellationChangeToken(_inventoryListToken.Token));

            _cache.Set(cacheKey, dto, options);
            return dto;
        }

        public async Task<IEnumerable<InventoryItemDto>> GetByPharmacyAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            string cacheKey = $"{ItemsByPharmacyPrefix}{pharmacyId}";

            if (_cache.TryGetValue<IEnumerable<InventoryItemDto>>(cacheKey, out var cached)
                && cached != null)
            {
                _logger.LogDebug("Cache HIT: Inventory for pharmacy {PharmacyId}", pharmacyId);
                return cached;
            }

            var entities = await _unitOfWork.InventoryItems
                .GetByPharmacyAsync(pharmacyId, cancellationToken);
            var entityList = entities.ToList();

            foreach (var item in entityList)
                UpdateProductStatus(item);

            var dtos = _mapper.Map<List<InventoryItemDto>>(entityList);

            for (int i = 0; i < dtos.Count; i++)
                await ApplyDiscountToDtoAsync(dtos[i], entityList[i]);

            var pharmacyToken = GetOrCreatePharmacyToken(pharmacyId);
            var options = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheDurationMinutes))
                .SetSlidingExpiration(TimeSpan.FromMinutes(SlidingMinutes))
                .AddExpirationToken(new CancellationChangeToken(pharmacyToken.Token));

            _cache.Set(cacheKey, dtos, options);
            return dtos;
        }

        public async Task AddAsync(InventoryItemDto dto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<InventoryItem>(dto);
            UpdateProductStatus(entity);

            await _unitOfWork.InventoryItems.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            InvalidateCache(entity.PharmacyID, entity.Id);

            _logger.LogInformation(
                "Inventory item {Id} added to pharmacy {PharmacyId}. Caches invalidated.",
                entity.Id, entity.PharmacyID);
        }

        public async Task UpdateAsync(int id, InventoryItemDto dto, CancellationToken cancellationToken = default)
        {
            var existing = await _unitOfWork.InventoryItems.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException("Inventory item not found.");

            int oldPharmacyId = existing.PharmacyID;

            _mapper.Map(dto, existing);
            UpdateProductStatus(existing);

            await _unitOfWork.InventoryItems.UpdateAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            InvalidateCache(existing.PharmacyID, id);

            if (oldPharmacyId != existing.PharmacyID)
            {
                InvalidateCache(oldPharmacyId, id);
                _logger.LogInformation(
                    "Inventory item {Id} moved from pharmacy {Old} to {New}",
                    id, oldPharmacyId, existing.PharmacyID);
            }

            _logger.LogInformation(
                "Inventory item {Id} updated in pharmacy {PharmacyId}. Caches invalidated.",
                id, existing.PharmacyID);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var existing = await _unitOfWork.InventoryItems.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException("Inventory item not found.");

            int pharmacyId = existing.PharmacyID;

            await _unitOfWork.InventoryItems.DeleteAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            InvalidateCache(pharmacyId, id);

            _logger.LogInformation(
                "Inventory item {Id} deleted from pharmacy {PharmacyId}. Caches invalidated.",
                id, pharmacyId);
        }

        private async Task ApplyDiscountToDtoAsync(InventoryItemDto dto, InventoryItem entity)
        {
            try
            {
                var discountedPrice = await _discountService.ApplyDiscountAsync(entity);
                dto.DiscountedPrice = discountedPrice;
                dto.DiscountValue = entity.Price - discountedPrice;
                dto.HasDiscount = discountedPrice < entity.Price;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Failed to apply discount for InventoryItem {Id} in Pharmacy {PharmacyId}",
                    entity.Id, entity.PharmacyID);

                dto.DiscountedPrice = entity.Price;
                dto.DiscountValue = 0;
                dto.HasDiscount = false;
            }
        }

        private void InvalidateCache(int pharmacyId, int itemId)
        {
            _cache.Remove($"{ItemByIdPrefix}{itemId}");
            InvalidatePharmacyInventoryToken(pharmacyId);
            InvalidateInventoryListToken();
            PharmacyService.InvalidatePharmacyCache(pharmacyId);
        }

        private static void InvalidatePharmacyInventoryToken(int pharmacyId)
        {
            lock (_tokenLock)
            {
                if (_pharmacyInventoryTokens.TryGetValue(pharmacyId, out var token))
                {
                    token.Cancel();
                    token.Dispose();
                    _pharmacyInventoryTokens.Remove(pharmacyId);
                }
            }
        }

        private static void InvalidateInventoryListToken()
        {
            var oldToken = _inventoryListToken;
            _inventoryListToken = new CancellationTokenSource();
            oldToken.Cancel();
            oldToken.Dispose();
        }

        private static CancellationTokenSource GetOrCreatePharmacyToken(int pharmacyId)
        {
            lock (_tokenLock)
            {
                if (!_pharmacyInventoryTokens.TryGetValue(pharmacyId, out var token)
                    || token.IsCancellationRequested)
                {
                    token = new CancellationTokenSource();
                    _pharmacyInventoryTokens[pharmacyId] = token;
                }
                return token;
            }
        }

        private static void UpdateProductStatus(InventoryItem item)
        {
            const int lowStockThreshold = 10;

            if (item.ExpiryDate.Date < DateTime.UtcNow.Date || item.Quantity == 0)
                item.Status = ProductStatus.OutOfStock;
            else if (item.Quantity <= lowStockThreshold)
                item.Status = ProductStatus.LowStock;
            else
                item.Status = ProductStatus.InStock;
        }

        private static string BuildCacheKey(int pharmacyId, InventoryItemFilterDto f)
        {
            return $"Inventory_Page_ph{pharmacyId}" +
                   $"_p{f.PageNumber}_s{f.PageSize}" +
                   $"_m{f.MedicineId?.ToString() ?? "_"}" +
                   $"_c{f.CategoryId?.ToString() ?? "_"}" +
                   $"_st{f.Status?.ToString() ?? "_"}" +
                   $"_q{f.SearchTerm ?? "_"}";   // ✅ include SearchTerm in cache key
        }
    }
}
