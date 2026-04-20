using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IAdService
    {
        //Create a new ad and return it with its generated Id.
        Task<AdDto> CreateAsync(AdDto dto, CancellationToken cancellationToken = default);

        //All active ads — used by the home-page OffersSection.
        Task<IEnumerable<AdDto>> GetAllActiveAsync(CancellationToken cancellationToken = default);

        //Active ads for one pharmacy — used by PharmacyDetails
        Task<IEnumerable<AdDto>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken cancellationToken = default);

        //<summary>Soft-delete (sets IsActive = false)
        Task DeactivateAsync(int id, CancellationToken cancellationToken = default);

        //Toggle IsActive flag
        Task SetStatusAsync(int id, bool isActive, CancellationToken cancellationToken = default);
    }
}
