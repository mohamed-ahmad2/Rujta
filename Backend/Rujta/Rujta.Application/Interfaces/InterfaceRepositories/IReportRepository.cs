using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Rujta.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IReportRepository
    {
        Task<PharmacyReportDto> GetPharmacyReportAsync(
            ReportFilterDto filter,
            CancellationToken cancellationToken = default
        );

        Task<IEnumerable<DailySalesDto>> GetDailySalesAsync(
            int pharmacyId,
            DateTime from,
            DateTime to,
            CancellationToken cancellationToken = default
        );

        Task<IEnumerable<TopProductDto>> GetTopProductsAsync(
            int pharmacyId,
            int topN,
            DateTime from,
            DateTime to,
            CancellationToken cancellationToken = default
        );

        Task<IEnumerable<LowStockItemDto>> GetLowStockItemsAsync(
            int pharmacyId,
            int threshold,
            CancellationToken cancellationToken = default
        );

        Task<IEnumerable<ExpiredItemDto>> GetExpiredItemsAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default
        );
    }
}

