using Microsoft.AspNetCore.Mvc;
using Rujta.Domain.Entities;


namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IPharmacyRepository : IGenericRepository<Pharmacy>
    {
        Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default);

        // Get all medicine IDs in a pharmacy
        Task<List<int>> GetAllMedicineIdsAsync(int pharmacyId);

        // Get stock of a specific medicine in a pharmacy
        Task<int> GetMedicineStockAsync(int pharmacyId, int medicineId);
    }
   
}
