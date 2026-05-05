

using Rujta.Domain.Common;

namespace Rujta.Infrastructure.Repositories
{
    public class PeopleRepository : GenericRepository<Person, Guid>, IPeopleRepository
    {
        public PeopleRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Person?> GetByGuidAsync(Guid guid, CancellationToken cancellationToken = default)=>
            await _context.People.FirstOrDefaultAsync(p => p.Id == guid, cancellationToken);

        public async Task<TPerson?> GetByIdAsync<TPerson>(Guid id, CancellationToken cancellationToken = default)
           where TPerson : Person
        {
            return await _context.Set<TPerson>()
                                 .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

    }
}
