

using Rujta.Domain.Common;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IPeopleRepository : IGenericRepository<Person, Guid>
    {
        Task<Person?> GetByGuidAsync(Guid guid, CancellationToken cancellationToken = default);
    }
}
