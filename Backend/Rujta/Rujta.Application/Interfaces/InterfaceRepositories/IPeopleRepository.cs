

using Rujta.Domain.Common;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IPeopleRepository : IGenericRepository<Person>
    {
        Task<Person?> GetByGuidAsync(Guid guid, CancellationToken cancellationToken = default);
    }
}
