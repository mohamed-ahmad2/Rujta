using Rujta.Application.DTOs.AdDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IAdService
    {
        Task<AdDto> CreateAsync(AdDto dto, CancellationToken cancellationToken = default);
        Task<IEnumerable<AdDto>> GetAllActiveAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<AdDto>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken cancellationToken = default);
        Task DeactivateAsync(int id, CancellationToken cancellationToken = default);
        Task SetStatusAsync(int id, bool isActive, CancellationToken cancellationToken = default);
    }
}
