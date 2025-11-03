using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IPharmacyRepository : IGenericRepository<Pharmacy>
    {
        Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default);

    }
}
