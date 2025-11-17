using Rujta.Domain.Entities;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IMedicineRepository : IGenericRepository<Medicine>
    {
 
        Task<IEnumerable<Medicine>> GetExpiredMedicinesAsync( CancellationToken cancellationToken = default);
        Task<IEnumerable<Medicine>> GetExpiringSoonMedicinesAsync(int days = 30, CancellationToken cancellationToken = default);
    }
}
