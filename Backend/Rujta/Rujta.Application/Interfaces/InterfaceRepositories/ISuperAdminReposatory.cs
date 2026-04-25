using Rujta.Application.DTOs.PharmacyDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface ISuperAdminRepository
    {
        Task AddAsync(Pharmacy pharmacy, CancellationToken cancellationToken);
        Task<Pharmacy?> GetByIdAsync(int id, CancellationToken cancellationToken);
        Task<IEnumerable<Pharmacy>> GetAllAsync(CancellationToken cancellationToken);

        // 🔥 NEW
        Task<int> GetTotalOrdersAsync(int pharmacyId, CancellationToken cancellationToken);
        Task<List<PharmacyStatsDto>> GetTopPharmaciesAsync(int count, CancellationToken cancellationToken);

    }
}
