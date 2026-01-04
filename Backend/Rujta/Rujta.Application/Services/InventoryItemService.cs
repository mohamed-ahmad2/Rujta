using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;

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

        public async Task<IEnumerable<InventoryItemDto>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            var entities = await _unitOfWork.InventoryItems
                .GetAllAsync(cancellationToken);

            return _mapper.Map<IEnumerable<InventoryItemDto>>(entities);
        }

        public async Task<InventoryItemDto?> GetByIdAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.InventoryItems
                .GetByIdAsync(id, cancellationToken);

            return entity == null
                ? null
                : _mapper.Map<InventoryItemDto>(entity);
        }

        public async Task AddAsync(
            InventoryItemDto dto,
            CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<InventoryItem>(dto);

            await _unitOfWork.InventoryItems.AddAsync(entity, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task UpdateAsync(
            int id,
            InventoryItemDto dto,
            CancellationToken cancellationToken = default)
        {
            var existing = await _unitOfWork.InventoryItems
                .GetByIdAsync(id, cancellationToken);

            if (existing == null)
                throw new KeyNotFoundException("Inventory item not found.");

            _mapper.Map(dto, existing);

            await _unitOfWork.InventoryItems.UpdateAsync(existing, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task DeleteAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
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

            return _mapper.Map<IEnumerable<InventoryItemDto>>(entities);
        }
    }
}
