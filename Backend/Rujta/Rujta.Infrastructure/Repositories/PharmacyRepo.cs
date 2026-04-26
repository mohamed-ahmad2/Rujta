namespace Rujta.Infrastructure.Repositories
{
    public class PharmacyRepo : GenericRepository<Pharmacy, int>, IPharmacyRepository
    {
        public PharmacyRepo(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default) =>
            await _context.Pharmacies.ToListAsync(cancellationToken);

        public async Task<List<Medicine>> GetAllMedicinesByPharmacyAsync(int pharmacyId)
        {
            return await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId)
                .Include(i => i.Medicine)
                .Where(i => i.Medicine != null)
                .Select(i => i.Medicine!)  
                .Distinct()
                .ToListAsync();
        }

        public async Task<int> GetMedicineStockAsync(int pharmacyId, int medicineId)
        {
            return await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId && i.MedicineID == medicineId)
                .Select(i => i.Quantity)
                .FirstOrDefaultAsync();
        }

        public async Task<Pharmacy?> GetByAdminIdAsync(Guid adminId) => await _context.Pharmacies
                .Include(p => p.Subscription)
                .FirstOrDefaultAsync(p => p.AdminId == adminId);

        public async Task<List<Pharmacy>> GetPharmaciesByIdsAsync(List<int> ids)
        {
            return await _context.Pharmacies
                .Where(p => ids.Contains(p.Id))
                .ToListAsync();
        }
    }
}
