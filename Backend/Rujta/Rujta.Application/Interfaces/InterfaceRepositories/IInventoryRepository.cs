using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IInventoryRepository : IGenericRepository<InventoryItem>
    {
        Task<IEnumerable<InventoryItem>> GetByPharmacyAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default);

        Task<bool> ExistsAsync(
            int id,
            int pharmacyId,
            CancellationToken cancellationToken = default);

        Task<InventoryItem?> GetByMedicineAndPharmacyAsync(
            int medicineId,
            int pharmacyId,
            CancellationToken cancellationToken = default);
    }
}
