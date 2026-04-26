namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IPharmacyRepository : IGenericRepository<Pharmacy, int>
    {
        Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default);

        Task<List<Medicine>> GetAllMedicinesByPharmacyAsync(int pharmacyId);

        Task<int> GetMedicineStockAsync(int pharmacyId, int medicineId);
        Task<Pharmacy?> GetByAdminIdAsync(Guid adminId);

        Task<List<Pharmacy>> GetPharmaciesByIdsAsync(List<int> ids);
    }
}
