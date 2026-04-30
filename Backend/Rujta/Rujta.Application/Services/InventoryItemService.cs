using Microsoft.Extensions.Caching.Memory;
using Rujta.Application.DTOs.InventoryDto;

namespace Rujta.Application.Services
{
    public class InventoryItemService : IInventoryItemService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private readonly IDiscountService _discountService; 

        private const int CacheDurationMinutes = 5;
        private const string AllItemsCacheKey = "InventoryItems_All";

        public InventoryItemService(IUnitOfWork unitOfWork,IMapper mapper,IMemoryCache cache,IDiscountService discountService) 
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
            _discountService = discountService;
        }

        public async Task<IEnumerable<InventoryItemDto>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            if (_cache.TryGetValue<IEnumerable<InventoryItemDto>>(AllItemsCacheKey, out var cached) && cached != null)
                return cached;

            var entities = await _unitOfWork.InventoryItems.GetAllAsync(cancellationToken);
            var entityList = entities.ToList();

            foreach (var item in entityList)
                UpdateProductStatus(item);

            var dtos = _mapper.Map<List<InventoryItemDto>>(entityList);

            for (int i = 0; i < dtos.Count; i++)
                await ApplyDiscountToDtoAsync(dtos[i], entityList[i]);

            _cache.Set(AllItemsCacheKey, dtos, TimeSpan.FromMinutes(CacheDurationMinutes));
            return dtos;
        }

        public async Task<InventoryItemDto?> GetByIdAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            string cacheKey = $"InventoryItem_{id}";
            if (_cache.TryGetValue<InventoryItemDto>(cacheKey, out var cached) && cached != null)
                return cached;

            var entity = await _unitOfWork.InventoryItems.GetByIdAsync(id, cancellationToken);
            if (entity == null) return null;

            UpdateProductStatus(entity);

            var dto = _mapper.Map<InventoryItemDto>(entity);

            await ApplyDiscountToDtoAsync(dto, entity);

            _cache.Set(cacheKey, dto, TimeSpan.FromMinutes(CacheDurationMinutes));
            return dto;
        }

        public async Task<IEnumerable<InventoryItemDto>> GetByPharmacyAsync(int pharmacyId,CancellationToken cancellationToken = default)
        {
            string cacheKey = $"InventoryItems_Pharmacy_{pharmacyId}";
            if (_cache.TryGetValue<IEnumerable<InventoryItemDto>>(cacheKey, out var cached) && cached != null)
                return cached;

            var entities = await _unitOfWork.InventoryItems
                .GetByPharmacyAsync(pharmacyId, cancellationToken);
            var entityList = entities.ToList();

            foreach (var item in entityList)
                UpdateProductStatus(item);

            var dtos = _mapper.Map<List<InventoryItemDto>>(entityList);

            for (int i = 0; i < dtos.Count; i++)
                await ApplyDiscountToDtoAsync(dtos[i], entityList[i]);

            _cache.Set(cacheKey, dtos, TimeSpan.FromMinutes(CacheDurationMinutes));
            return dtos;
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
            catch
            {
                dto.DiscountedPrice = entity.Price;
                dto.DiscountValue = 0;
                dto.HasDiscount = false;
            }
        }

        public async Task AddAsync(InventoryItemDto dto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<InventoryItem>(dto);
            UpdateProductStatus(entity);
            await _unitOfWork.InventoryItems.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
            InvalidateCache(entity.PharmacyID, entity.Id);
        }

        public async Task UpdateAsync(int id, InventoryItemDto dto, CancellationToken cancellationToken = default)
        {
            var existing = await _unitOfWork.InventoryItems.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException("Inventory item not found.");

            _mapper.Map(dto, existing);
            UpdateProductStatus(existing);
            await _unitOfWork.InventoryItems.UpdateAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
            InvalidateCache(existing.PharmacyID, id);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var existing = await _unitOfWork.InventoryItems.GetByIdAsync(id, cancellationToken)
                ?? throw new KeyNotFoundException("Inventory item not found.");

            await _unitOfWork.InventoryItems.DeleteAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
            InvalidateCache(existing.PharmacyID, id);
        }

        private void InvalidateCache(int pharmacyId, int itemId)
        {
            _cache.Remove(AllItemsCacheKey);
            _cache.Remove($"InventoryItems_Pharmacy_{pharmacyId}");
            _cache.Remove($"InventoryItem_{itemId}");
        }

        private static void UpdateProductStatus(InventoryItem item)
        {
            const int lowStockThreshold = 10;

            if (item.ExpiryDate < DateTime.UtcNow || item.Quantity == 0)
                item.Status = ProductStatus.OutOfStock;
            else if (item.Quantity <= lowStockThreshold)
                item.Status = ProductStatus.LowStock;
            else
                item.Status = ProductStatus.InStock;
        }
    }
}