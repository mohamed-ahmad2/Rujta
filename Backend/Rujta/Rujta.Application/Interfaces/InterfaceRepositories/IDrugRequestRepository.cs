using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IDrugRequestRepository : IGenericRepository<DrugRequest, int>
    {
        Task<IEnumerable<DrugRequest>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken ct = default);
        Task<IEnumerable<DrugRequest>> GetPendingAsync(CancellationToken ct = default);
        Task<IEnumerable<DrugRequest>> GetAllWithFilterAsync(DrugRequestStatus? status, int? pharmacyId, CancellationToken ct = default);
    }
}
