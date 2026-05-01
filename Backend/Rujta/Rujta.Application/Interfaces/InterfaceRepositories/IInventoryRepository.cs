using System.Linq.Expressions;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IInventoryRepository : IGenericRepository<InventoryItem, int>
    {
        Task<IEnumerable<InventoryItem>> GetByPharmacyAsync(int pharmacyId,CancellationToken cancellationToken = default);

        Task<bool> ExistsAsync(int id,int pharmacyId,CancellationToken cancellationToken = default);

        Task<InventoryItem?> GetByMedicineAndPharmacyAsync(int medicineId,int pharmacyId,CancellationToken cancellationToken = default);
        public Task<decimal?> GetMinMedicinePriceAsync(Expression<Func<InventoryItem, bool>> predicate,CancellationToken cancellationToken = default);
    }
}
