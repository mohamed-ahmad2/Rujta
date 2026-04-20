using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IAdRepository : IGenericRepository<Ad, int>
    {
        Task<IEnumerable<Ad>> GetAllActiveAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Ad>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken cancellationToken = default);
        Task DeactivateAsync(int id, CancellationToken cancellationToken = default);
        Task SetStatusAsync(int id, bool isActive, CancellationToken cancellationToken = default);
    }
}
