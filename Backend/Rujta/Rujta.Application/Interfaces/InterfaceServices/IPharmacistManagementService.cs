using Rujta.Application.DTOs;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IPharmacistManagementService : IGenericService<PharmacistDto>
    {
        Task<IEnumerable<PharmacistDto>> GetPharmacistByManagerAsync(Guid managerId, CancellationToken cancellationToken = default);
        Task<IEnumerable<PharmacistDto>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken cancellationToken = default);
    }
}
