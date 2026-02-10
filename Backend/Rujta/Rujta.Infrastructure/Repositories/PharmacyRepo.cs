using Microsoft.EntityFrameworkCore;
using Rujta.Domain.Entities;
using Rujta.Application.Interfaces.InterfaceRepositories;

namespace Rujta.Infrastructure.Repositories
{
    public class PharmacyRepo : GenericRepository<Pharmacy>, IPharmacyRepository
    {
        public PharmacyRepo(AppDbContext context) : base(context) { }

        // Get all pharmacies
        public async Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default) =>
            await _context.Pharmacies.ToListAsync(cancellationToken);

        // Get all medicine IDs in a pharmacy
        public async Task<List<int>> GetAllMedicineIdsAsync(int pharmacyId)
        {
            return await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId)
                .Select(i => i.MedicineID)
                .ToListAsync();
        }

        // Get stock of a specific medicine
        public async Task<int> GetMedicineStockAsync(int pharmacyId, int medicineId)
        {
            return await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId && i.MedicineID == medicineId)
                .Select(i => i.Quantity)
                .FirstOrDefaultAsync();
        }
    }
}
