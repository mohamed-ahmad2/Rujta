using Rujta.Application.DTOs.PharmacyDto;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface ISuperAdminRepository : IGenericRepository<Admin, Guid>
    {
        Task<int> GetTotalOrdersAsync(int pharmacyId, CancellationToken cancellationToken);
        Task<List<PharmacyStatsDto>> GetTopPharmaciesAsync(int count, CancellationToken cancellationToken);

    }
}
