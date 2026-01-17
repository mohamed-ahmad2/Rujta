namespace Rujta.Application.Services
{
    public class InventoryItemService : IInventoryItemService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public InventoryItemService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<InventoryItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _unitOfWork.InventoryItems
                .GetAllAsync(cancellationToken);

            foreach (var item in entities)
                UpdateProductStatus(item);

            return _mapper.Map<IEnumerable<InventoryItemDto>>(entities);
        }

        public async Task<InventoryItemDto?> GetByIdAsync(int id,CancellationToken cancellationToken = default){
            var entity = await _unitOfWork.InventoryItems
                .GetByIdAsync(id, cancellationToken);

            return entity == null
                ? null
                : _mapper.Map<InventoryItemDto>(entity);
        }

        public async Task AddAsync(InventoryItemDto dto,CancellationToken cancellationToken = default){
            var entity = _mapper.Map<InventoryItem>(dto);

            UpdateProductStatus(entity);

            await _unitOfWork.InventoryItems.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
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
        }

        public async Task<IEnumerable<InventoryItemDto>> GetByPharmacyAsync(int pharmacyId,CancellationToken cancellationToken = default)
        {
            var entities = await _unitOfWork.InventoryItems
                .GetByPharmacyAsync(pharmacyId, cancellationToken);

            foreach (var item in entities)
                UpdateProductStatus(item);

            return _mapper.Map<IEnumerable<InventoryItemDto>>(entities);
        }
    }
}
