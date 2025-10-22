using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces
{
    public interface IPharmacyRepository
    {
        IEnumerable<Pharmacy> GetAllPharmacies();
    }
}
