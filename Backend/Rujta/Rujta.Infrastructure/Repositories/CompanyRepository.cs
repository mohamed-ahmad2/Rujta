namespace Rujta.Infrastructure.Repositories
{
    public class CompanyRepository : GenericRepository<Company, int>, ICompanyRepository
    {
        public CompanyRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Company>> GetCompaniesMedicinesAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            return await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId
                         && i.Medicine != null
                         && i.Medicine.Company != null)
                .Select(i => i.Medicine!.Company!)
                .Distinct()
                .ToListAsync(cancellationToken);
        }
    }
}
