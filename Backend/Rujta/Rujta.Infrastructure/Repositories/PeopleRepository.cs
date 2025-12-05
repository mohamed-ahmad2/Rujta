

using Rujta.Domain.Common;

namespace Rujta.Infrastructure.Repositories
{
    public class PeopleRepository : GenericRepository<Person>, IPeopleRepository
    {
        public PeopleRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Person?> GetByGuidAsync(Guid guid, CancellationToken cancellationToken = default)=>
            await _context.People.FirstOrDefaultAsync(p => p.Id == guid, cancellationToken);
        
    }
}
