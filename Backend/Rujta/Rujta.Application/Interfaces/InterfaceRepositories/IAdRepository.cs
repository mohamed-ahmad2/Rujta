using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{

    public interface IAdRepository : IGenericRepository<Ad, int>
    {
        //Returns all active ads (for the home page OffersSection).
        Task<IEnumerable<Ad>> GetAllActiveAsync(CancellationToken cancellationToken = default);

        // Returns all active ads belonging to a specific pharmacy
        Task<IEnumerable<Ad>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken cancellationToken = default);

        // Soft-deletes an ad by setting IsActive = false
        Task DeactivateAsync(int id, CancellationToken cancellationToken = default);

        //Toggles the IsActive flag on an ad.
        Task SetStatusAsync(int id, bool isActive, CancellationToken cancellationToken = default);
    }
}
