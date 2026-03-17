using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IPrescriptionService
    {
        Task<PrescriptionResultDto> AnalyzePrescriptionAsync(
            Stream imageStream,
            int pharmacyId,
            CancellationToken cancellationToken = default);
    }
}
