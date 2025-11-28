using Rujta.Domain.Entities;


namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IPharmacyRepository : IGenericRepository<Pharmacy>
    {
        Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default);
        Task<int> GetMedicineStockAsync(int pharmacyId, int medicineId);


    }
}
