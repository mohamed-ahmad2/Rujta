using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices.IGenericS;

namespace Rujta.Application.Interfaces.InterfaceServices.IPharmacy
{
    public interface IPharmacistManagementService : IGenericService<PharmacistDto,Guid>
    {
        Task<IEnumerable<PharmacistDto>> GetPharmacistByManagerAsync(Guid managerId, CancellationToken cancellationToken = default);
        Task<IEnumerable<PharmacistDto>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken cancellationToken = default);
        Task<IEnumerable<PharmacistDto>> GetPharmacistsByIdsAsync(IEnumerable<string>? ids, CancellationToken cancellationToken = default);
    }
}
