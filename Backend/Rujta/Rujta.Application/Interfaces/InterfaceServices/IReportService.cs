using Rujta.Application.DTOs;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IReportService
    {
        Task<PharmacyReportDto> GetPharmacyReportAsync(
            Guid adminId,
            CancellationToken cancellationToken = default);
    }

}

