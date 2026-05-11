using System.Linq.Expressions;

namespace Rujta.Infrastructure.Repositories
{
    public class InventoryRepository : GenericRepository<InventoryItem, int>, IInventoryRepository
    {
        public InventoryRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<InventoryItem>> GetByPharmacyAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
            => await _context.InventoryItems
                             .AsNoTracking()
                             .Include(i => i.Medicine)
                                 .ThenInclude(m => m!.Category)
                             .Include(i => i.Medicine)
                                 .ThenInclude(m => m!.Company)
                             .Where(i => i.PharmacyID == pharmacyId)
                             .OrderBy(i => i.Id)
                             .ToListAsync(cancellationToken);

        public async Task<bool> ExistsAsync(
            int id,
            int pharmacyId,
            CancellationToken cancellationToken = default)
            => await _context.InventoryItems
                             .AnyAsync(i => i.Id == id && i.PharmacyID == pharmacyId,
                                       cancellationToken);

        public override async Task<InventoryItem?> GetByIdAsync(
            int id,
            CancellationToken cancellationToken = default)
            => await _context.InventoryItems
                             .AsNoTracking()
                             .Include(i => i.Medicine)
                                 .ThenInclude(m => m!.Category)
                             .Include(i => i.Medicine)
                                 .ThenInclude(m => m!.Company)
                             .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        public override async Task<IEnumerable<InventoryItem>> GetAllAsync(
            CancellationToken cancellationToken = default)
            => await _context.InventoryItems
                             .AsNoTracking()
                             .Include(i => i.Medicine)
                                 .ThenInclude(m => m!.Category)
                             .Include(i => i.Medicine)
                                 .ThenInclude(m => m!.Company)
                             .OrderBy(i => i.Id)
                             .ToListAsync(cancellationToken);

        public async Task<InventoryItem?> GetByMedicineAndPharmacyAsync(
            int medicineId,
            int pharmacyId,
            CancellationToken cancellationToken = default)
            => await _context.InventoryItems
                             .FirstOrDefaultAsync(i => i.MedicineID == medicineId
                                                    && i.PharmacyID == pharmacyId,
                                                  cancellationToken);

        public async Task<decimal?> GetMinMedicinePriceAsync(
            Expression<Func<InventoryItem, bool>> predicate,
            CancellationToken cancellationToken = default)
        {
            var query = _context.InventoryItems
                                .AsNoTracking()
                                .Include(i => i.Medicine)
                                .Where(predicate)
                                .Where(i => i.Medicine != null);

            if (!await query.AnyAsync(cancellationToken))
                return null;

            return await query
                .Select(i => i.Medicine!.Price)
                .MinAsync(cancellationToken);
        }

        public async Task<Dictionary<int, List<InventoryItem>>> GetInventoryByMedicineIdsAsync(
    int pharmacyId,
    IEnumerable<int> medicineIds,
    CancellationToken cancellationToken = default)
        {
            var items = await _context.InventoryItems
                .AsNoTracking()
                .Include(i => i.Medicine)
                .Where(i => i.PharmacyID == pharmacyId && medicineIds.Contains(i.MedicineID))
                .ToListAsync(cancellationToken);

            return items.GroupBy(i => i.MedicineID)
                        .ToDictionary(g => g.Key, g => g.ToList());
        }

        public async Task<Dictionary<int, InventoryItem>> GetBestInventoryItemsAsync(
            int pharmacyId,
            IEnumerable<int> medicineIds,
            CancellationToken cancellationToken = default)
        {
            var items = await _context.InventoryItems
                .AsNoTracking()
                .Include(i => i.Medicine)
                .Where(i => i.PharmacyID == pharmacyId
                         && medicineIds.Contains(i.MedicineID)
                         && i.Quantity > 0)
                .ToListAsync(cancellationToken);

            return items
                .GroupBy(i => i.MedicineID)
                .Select(g => new
                {
                    MedicineId = g.Key,
                    BestItem = g.OrderByDescending(i => i.ExpiryDate) 
                               .ThenByDescending(i => i.Quantity)
                               .FirstOrDefault()
                })
                .Where(x => x.BestItem != null)
                .ToDictionary(x => x.MedicineId, x => x.BestItem!);
        }
    }
}