using Rujta.Domain.Common;

namespace Rujta.Infrastructure.Repositories
{
    public class PharmacistRepository : GenericRepository<Pharmacist>, IPharmacistRepository
    {
        public PharmacistRepository(AppDbContext context) : base(context){}

        public async Task<IEnumerable<Pharmacist>> GetPharmacistByManagerAsync(Guid managerId, CancellationToken cancellationToken = default) =>
            await _context.Set<Pharmacist>()
                .Where(s => s.ManagerId == managerId)
                .ToListAsync(cancellationToken);
        

        public async Task<Pharmacist?> GetByGuidAsync(Guid id,CancellationToken cancellationToken = default) =>
            await _context.Set<Pharmacist>()
                .Include(p => p.Pharmacy)
                .Include(p => p.Manager)
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }
}
