using Rujta.Domain.Common;
using Rujta.Domain.Entities;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IPharmacistRepository : IGenericRepository<Pharmacist>
    {
        Task<IEnumerable<Pharmacist>> GetPharmacistByManagerAsync(Guid managerId, CancellationToken cancellationToken = default);
        Task<Pharmacist?> GetByGuidAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Pharmacist>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken cancellationToken = default);
    }
}
