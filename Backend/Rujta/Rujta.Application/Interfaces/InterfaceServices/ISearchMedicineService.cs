using Rujta.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface ISearchMedicineService
    {
        Task<IEnumerable<MedicineDto>> SearchAsync(string query, int top = 10, CancellationToken cancellationToken = default);
    }
}
