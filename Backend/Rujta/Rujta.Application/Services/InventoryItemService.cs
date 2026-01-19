using Microsoft.Extensions.Caching.Memory;

namespace Rujta.Application.Services
{
    public class InventoryItemService : IInventoryItemService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        private readonly IMemoryCache _cache;

        private const int CacheDurationMinutes = 5;
        private const string AllItemsCacheKey = "InventoryItems_All";

        public InventoryItemService(IUnitOfWork unitOfWork, IMapper mapper, IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<IEnumerable<InventoryItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            if (_cache.TryGetValue<IEnumerable<InventoryItemDto>>(AllItemsCacheKey, out var cached) && cached != null)
                return cached;

            var entities = await _unitOfWork.InventoryItems
                .GetAllAsync(cancellationToken);

            foreach (var item in entities)
                UpdateProductStatus(item);

            var result = _mapper.Map<IEnumerable<InventoryItemDto>>(entities);
            _cache.Set(AllItemsCacheKey, result, TimeSpan.FromMinutes(CacheDurationMinutes));

            return result;
        }

        public async Task<InventoryItemDto?> GetByIdAsync(int id,CancellationToken cancellationToken = default){
            string cacheKey = $"InventoryItem_{id}";
            if (_cache.TryGetValue<InventoryItemDto>(cacheKey, out var cached) && cached != null)
                return cached;

            var entity = await _unitOfWork.InventoryItems
                .GetByIdAsync(id, cancellationToken);

            if (entity == null) return null;

            UpdateProductStatus(entity);
            var result = _mapper.Map<InventoryItemDto>(entity);
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(CacheDurationMinutes));

            return result;
        }

        public async Task AddAsync(InventoryItemDto dto,CancellationToken cancellationToken = default){
            var entity = _mapper.Map<InventoryItem>(dto);

            UpdateProductStatus(entity);

            await _unitOfWork.InventoryItems.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove(AllItemsCacheKey);
            _cache.Remove($"InventoryItems_Pharmacy_{entity.PharmacyID}");
            _cache.Remove($"InventoryItem_{entity.Id}");
        }

        public async Task UpdateAsync(int id,InventoryItemDto dto,CancellationToken cancellationToken = default){
            var existing = await _unitOfWork.InventoryItems
                .GetByIdAsync(id, cancellationToken);

            if (existing == null)
                throw new KeyNotFoundException("Inventory item not found.");

            _mapper.Map(dto, existing);

            UpdateProductStatus(existing);

            await _unitOfWork.InventoryItems.UpdateAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove(AllItemsCacheKey);
            _cache.Remove($"InventoryItems_Pharmacy_{existing.PharmacyID}");
            _cache.Remove($"InventoryItem_{id}");
        }


        private static void UpdateProductStatus(InventoryItem item)
        {
            int lowStockThreshold = 10;

            if (item.ExpiryDate < DateTime.UtcNow)
            {
                item.Status = ProductStatus.OutOfStock;
            }
            else if (item.Quantity == 0)
            {
                item.Status = ProductStatus.OutOfStock;
            }
            else if (item.Quantity <= lowStockThreshold)
            {
                item.Status = ProductStatus.LowStock;
            }
            else
            {
                item.Status = ProductStatus.InStock;
            }
        }

        public async Task DeleteAsync(int id,CancellationToken cancellationToken = default){
            var existing = await _unitOfWork.InventoryItems
                .GetByIdAsync(id, cancellationToken);

            if (existing == null)
                throw new KeyNotFoundException("Inventory item not found.");

            await _unitOfWork.InventoryItems.DeleteAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove(AllItemsCacheKey);
            _cache.Remove($"InventoryItems_Pharmacy_{existing.PharmacyID}");
            _cache.Remove($"InventoryItem_{id}");
        }

        public async Task<IEnumerable<InventoryItemDto>> GetByPharmacyAsync(int pharmacyId,CancellationToken cancellationToken = default)
        {
            string cacheKey = $"InventoryItems_Pharmacy_{pharmacyId}";
            if (_cache.TryGetValue<IEnumerable<InventoryItemDto>>(cacheKey, out var cached) && cached != null)
                return cached;

            var entities = await _unitOfWork.InventoryItems
                .GetByPharmacyAsync(pharmacyId, cancellationToken);

            foreach (var item in entities)
                UpdateProductStatus(item);

            var result = _mapper.Map<IEnumerable<InventoryItemDto>>(entities);
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(CacheDurationMinutes));

            return result;
        }
    }
}
