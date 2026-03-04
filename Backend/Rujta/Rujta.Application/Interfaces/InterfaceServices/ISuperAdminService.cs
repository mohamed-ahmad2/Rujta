using Rujta.Application.DTOs;
using Rujta.Application.DTOs.Rujta.Application.DTOs;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface ISuperAdminService
    {
        Task<CreatePharmacyResultDto> CreatePharmacyAsync(CreatePharmacyDto dto, CancellationToken cancellationToken = default);
        Task<IEnumerable<PharmacyDto>> GetAllPharmaciesAsync(CancellationToken cancellationToken = default);
        Task<PharmacyDto?> GetPharmacyByIdAsync(int pharmacyId, CancellationToken cancellationToken = default);
        Task<PharmacyDto> UpdatePharmacyAsync(int pharmacyId, UpdatePharmacyDto dto, CancellationToken cancellationToken = default);
        Task<string> ResetPharmacyAdminPasswordAsync(int pharmacyId, CancellationToken cancellationToken = default);
    }
}
