namespace Rujta.Infrastructure.Repositories
{
    public class InventoryRepository : GenericRepository<InventoryItem>, IInventoryRepository
    {
        

        public InventoryRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<InventoryItem>> GetByPharmacyAsync(int pharmacyId,CancellationToken cancellationToken = default) =>
                await _context.InventoryItems
                                .AsNoTracking()
                                .Include(i => i.Medicine)
                                    .ThenInclude(m => m!.Category)
                                .Where(i => i.PharmacyID == pharmacyId)
                                .ToListAsync(cancellationToken);

        

        public async Task<bool> ExistsAsync(int id,int pharmacyId,CancellationToken cancellationToken = default) =>
             await _context.InventoryItems
                .AnyAsync(i => i.Id == id && i.PharmacyID == pharmacyId, cancellationToken);

        public override async Task<InventoryItem?> GetByIdAsync(int id, CancellationToken cancellationToken = default)=>
            await _context.InventoryItems
                                 .AsNoTracking()
                                 .Include(i => i.Medicine)
                                     .ThenInclude(m => m!.Category)
                                 .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
        

        public override async Task<IEnumerable<InventoryItem>> GetAllAsync(CancellationToken cancellationToken = default) =>
            await _context.InventoryItems
                  .AsNoTracking()
                  .Include(i => i.Medicine)
                      .ThenInclude(m => m!.Category)
                  .ToListAsync(cancellationToken);

    }
}
