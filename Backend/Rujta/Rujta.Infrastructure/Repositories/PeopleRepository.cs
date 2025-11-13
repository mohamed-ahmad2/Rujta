

using Rujta.Domain.Common;

namespace Rujta.Infrastructure.Repositories
{
    public class PeopleRepository : GenericRepository<Person>, IPeopleRepository
    {
        public PeopleRepository(AppDbContext context) : base(context)
        {
        }
    }
}
