using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Services
{
    public class InventoryItemService : IInventoryItemService
    {
        private readonly IInventoryRepository _inventoryRepo;
        private readonly IUnitOfWork _unitOfWork;

        public InventoryItemService(IInventoryRepository inventoryRepo, IUnitOfWork unitOfWork)
        {
            _inventoryRepo = inventoryRepo;
            _unitOfWork = unitOfWork;
        }

        // ----------------- GenericService Methods -----------------

        public async Task<IEnumerable<InventoryItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var entities = await _inventoryRepo.GetAllAsync(cancellationToken);
            return entities.Select(ToDto);
        }

        public async Task<InventoryItemDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _inventoryRepo.GetByIdAsync(id, cancellationToken);
            return entity is null ? null : ToDto(entity);
        }

        public async Task AddAsync(InventoryItemDto dto, CancellationToken cancellationToken = default)
        {
            var entity = ToEntity(dto);
            await _inventoryRepo.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task UpdateAsync(int id, InventoryItemDto dto, CancellationToken cancellationToken = default)
        {
            var existing = await _inventoryRepo.GetByIdAsync(id, cancellationToken);
            if (existing == null || existing.PharmacyID != dto.PharmacyID)
                throw new KeyNotFoundException("Inventory item not found or access denied.");

            existing.MedicineID = dto.MedicineID;
            existing.Quantity = dto.Quantity;
            existing.Price = dto.Price;
            existing.ExpiryDate = dto.ExpiryDate;

            await _inventoryRepo.UpdateAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var existing = await _inventoryRepo.GetByIdAsync(id, cancellationToken);
            if (existing == null)
                throw new KeyNotFoundException("Inventory item not found.");

            await _inventoryRepo.DeleteAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        // ----------------- Custom method: Get by Pharmacy -----------------

        public async Task<IEnumerable<InventoryItemDto>> GetByPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var entities = await _inventoryRepo.GetByPharmacyAsync(pharmacyId, cancellationToken);
            return entities.Select(ToDto);
        }

        // ----------------- Helpers -----------------

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
