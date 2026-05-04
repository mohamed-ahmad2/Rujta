namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IPharmacyRepository : IGenericRepository<Pharmacy, int>
    {
        Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default);

        Task<List<Medicine>> GetAllMedicinesByPharmacyAsync(int pharmacyId);

        Task<List<InventoryItem>> GetInventoryItemsWithMedicineByPharmacyAsync(int pharmacyId);

        Task<bool> PharmacyHasMedicineAsync(int pharmacyId, int medicineId); 

        Task<int> GetMedicineStockAsync(int pharmacyId, int medicineId);
        Task<Pharmacy?> GetByAdminIdAsync(Guid adminId);
        Task<List<Pharmacy>> GetPharmaciesByIdsAsync(List<int> ids);

        Task<List<Pharmacy>> GetBranchesAsync(int parentId, CancellationToken cancellationToken = default);
        Task<List<Pharmacy>> GetMainPharmaciesAsync(CancellationToken cancellationToken = default);
        Task<int> CountBranchesAsync(int parentId, CancellationToken cancellationToken = default);
        Task<bool> IsMainPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default);

    }
}