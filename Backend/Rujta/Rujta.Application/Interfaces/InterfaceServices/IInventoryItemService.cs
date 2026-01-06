using Rujta.Application.DTOs;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IInventoryItemService : IGenericService<InventoryItemDto>
    {
        Task<IEnumerable<InventoryItemDto>> GetByPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default);
    }
}
