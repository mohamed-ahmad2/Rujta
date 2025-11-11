using Rujta.Application.DTOs;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IInventoryItemService : IGenericService<InventoryItemDto>
    {
        Task<IEnumerable<InventoryItemDto>> GetByPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default);
    }
}
