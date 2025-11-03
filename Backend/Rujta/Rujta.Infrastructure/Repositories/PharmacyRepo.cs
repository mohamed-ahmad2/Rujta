using Microsoft.EntityFrameworkCore;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;


namespace Rujta.Infrastructure.Repositories
{
    public class PharmacyRepo : GenericRepository<Pharmacy>, IPharmacyRepository
    {
        

        public PharmacyRepo(AppDbContext context) : base(context) { }
        

        public async Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default) =>
             await _context.Pharmacies.ToListAsync(cancellationToken);
        
    }
}
