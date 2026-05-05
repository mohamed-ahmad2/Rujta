using Rujta.Application.DTOs.InventoryDto;
using Rujta.Application.Interfaces.InterfaceServices.IGenericS;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IInventoryItemService : IGenericService<InventoryItemDto, int>
    {
        Task<IEnumerable<InventoryItemDto>> GetByPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default);
    }
}
