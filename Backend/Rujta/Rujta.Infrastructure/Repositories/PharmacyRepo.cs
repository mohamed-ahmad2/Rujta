namespace Rujta.Infrastructure.Repositories
{
    public class PharmacyRepo : GenericRepository<Pharmacy, int>, IPharmacyRepository
    {
        public PharmacyRepo(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Pharmacy>> GetAllPharmacies(
            CancellationToken cancellationToken = default)
            => await _context.Pharmacies.ToListAsync(cancellationToken);

        public async Task<List<Medicine>> GetAllMedicinesByPharmacyAsync(int pharmacyId)
            => await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId)
                .Include(i => i.Medicine)
                .Where(i => i.Medicine != null)
                .Select(i => i.Medicine!)
                .Distinct()
                .ToListAsync();

        public async Task<List<InventoryItem>> GetInventoryItemsWithMedicineByPharmacyAsync(
            int pharmacyId)
            => await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId && i.Medicine != null)
                .Include(i => i.Medicine)
                    .ThenInclude(m => m!.Company)
                .Include(i => i.Medicine)
                    .ThenInclude(m => m!.Category)
                .ToListAsync();

        public async Task<bool> PharmacyHasMedicineAsync(int pharmacyId, int medicineId)
            => await _context.InventoryItems
                .AnyAsync(i => i.PharmacyID == pharmacyId
                            && i.MedicineID == medicineId);

        public async Task<int> GetMedicineStockAsync(int pharmacyId, int medicineId)
            => await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId && i.MedicineID == medicineId)
                .Select(i => i.Quantity)
                .FirstOrDefaultAsync();

        public async Task<Pharmacy?> GetByAdminIdAsync(Guid adminId)
            => await _context.Pharmacies
                .Include(p => p.Subscription)
                .FirstOrDefaultAsync(p => p.AdminId == adminId);

        public async Task<List<Pharmacy>> GetPharmaciesByIdsAsync(List<int> ids)
            => await _context.Pharmacies
                .Where(p => ids.Contains(p.Id))
                .ToListAsync();

        public async Task<List<Pharmacy>> GetBranchesAsync(int parentId, CancellationToken cancellationToken = default)
            => await _context.Pharmacies
                .Where(p => p.ParentPharmacyID == parentId && !p.IsDeleted)
                .Include(p => p.Manager)
                .Include(p => p.Admin)
                .ToListAsync(cancellationToken);

        public async Task<List<Pharmacy>> GetMainPharmaciesAsync(CancellationToken cancellationToken = default)
            => await _context.Pharmacies
                .Where(p => p.ParentPharmacyID == null && !p.IsDeleted)
                .Include(p => p.Manager)
                .Include(p => p.Admin)
                .Include(p => p.Branches)
                .ToListAsync(cancellationToken);

        public async Task<int> CountBranchesAsync(int parentId, CancellationToken cancellationToken = default)
            => await _context.Pharmacies
                .CountAsync(p => p.ParentPharmacyID == parentId && !p.IsDeleted, cancellationToken);

        public async Task<bool> IsMainPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default)
            => await _context.Pharmacies
                .AnyAsync(p => p.Id == pharmacyId && p.ParentPharmacyID == null, cancellationToken);
    }
}