using Rujta.Application.DTOs;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IReportService
    {
        // بدل Guid adminId خليه int pharmacyId
        Task<PharmacyReportDto> GetPharmacyReportAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default);
    }
}
