
namespace Rujta.Infrastructure.Repositories
{
    public class CategoryRepository : GenericRepository<Category, int>, ICategoryRepository
    {
        public CategoryRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Category>> GetCategoriesMedicinesAsync(int pharmacyId,CancellationToken cancellationToken = default)
        {
            return await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId
                         && i.Medicine != null          
                         && i.Medicine.Category != null)
                .Select(i => i.Medicine!.Category!)     
                .Distinct()                             
                .ToListAsync(cancellationToken);
        }
    }
}
