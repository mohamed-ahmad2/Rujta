using System.Linq.Expressions;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IInventoryRepository : IGenericRepository<InventoryItem, int>
    {
        Task<IEnumerable<InventoryItem>> GetByPharmacyAsync(int pharmacyId,CancellationToken cancellationToken = default);

        Task<bool> ExistsAsync(int id,int pharmacyId,CancellationToken cancellationToken = default);

        Task<InventoryItem?> GetByMedicineAndPharmacyAsync(int medicineId,int pharmacyId,CancellationToken cancellationToken = default);
        Task<decimal?> GetMinMedicinePriceAsync(Expression<Func<InventoryItem, bool>> predicate,CancellationToken cancellationToken = default);
        Task<Dictionary<int, List<InventoryItem>>> GetInventoryByMedicineIdsAsync(
            int pharmacyId,
            IEnumerable<int> medicineIds,
            CancellationToken cancellationToken = default);

        Task<Dictionary<int, InventoryItem>> GetBestInventoryItemsAsync(
            int pharmacyId,
            IEnumerable<int> medicineIds,
            CancellationToken cancellationToken = default);

    }
}
