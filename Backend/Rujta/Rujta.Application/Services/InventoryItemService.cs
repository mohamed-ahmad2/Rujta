using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services
{
    public class InventoryItemService : IInventoryItemService
    {
        private readonly IUnitOfWork _unitOfWork;

        public InventoryItemService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<InventoryItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _unitOfWork.InventoryItems.GetAllAsync(cancellationToken);
            return entities.Select(ToDto);
        }

        public async Task<InventoryItemDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.InventoryItems.GetByIdAsync(id, cancellationToken);
            return entity is null ? null : ToDto(entity);
        }

        public async Task AddAsync(InventoryItemDto dto, CancellationToken cancellationToken = default)
        {
            var entity = ToEntity(dto);

            await _unitOfWork.InventoryItems.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task UpdateAsync(int id, InventoryItemDto dto, CancellationToken cancellationToken = default)
        {
            var existing = await _unitOfWork.InventoryItems.GetByIdAsync(id, cancellationToken);
            if (existing == null)
                throw new KeyNotFoundException("Inventory item not found.");

            existing.MedicineID = dto.MedicineID;
            existing.Quantity = dto.Quantity;
            existing.Price = dto.Price;
            existing.ExpiryDate = dto.ExpiryDate;

            await _unitOfWork.InventoryItems.UpdateAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var existing = await _unitOfWork.InventoryItems.GetByIdAsync(id, cancellationToken);
            if (existing == null)
                throw new KeyNotFoundException("Inventory item not found.");

            await _unitOfWork.InventoryItems.DeleteAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task<IEnumerable<InventoryItemDto>> GetByPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var entities = await _unitOfWork.InventoryItems.GetByPharmacyAsync(pharmacyId, cancellationToken);
            return entities.Select(ToDto);
        }

        // Helpers

        private static InventoryItemDto ToDto(InventoryItem item)
            => new InventoryItemDto
            {
                Id = item.Id,
                PharmacyID = item.PharmacyID,
                MedicineID = item.MedicineID,
                Quantity = item.Quantity,
                Price = item.Price,
                ExpiryDate = item.ExpiryDate
            };

        private static InventoryItem ToEntity(InventoryItemDto dto)
            => new InventoryItem
            {
                PharmacyID = dto.PharmacyID,
                MedicineID = dto.MedicineID,
                Quantity = dto.Quantity,
                Price = dto.Price,
                ExpiryDate = dto.ExpiryDate
            };
    }
}
