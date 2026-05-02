using Rujta.Application.DTOs;
using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IDrugRequestService
    {
        // ── PharmacyAdmin ────────────────────────────────────────
        Task<DrugRequestDto> SubmitAsync(CreateDrugRequestDto dto, int pharmacyId, string userId, CancellationToken ct = default);
        Task<IEnumerable<DrugRequestDto>> GetMyRequestsAsync(int pharmacyId, CancellationToken ct = default);

        // ── SuperAdmin ───────────────────────────────────────────
        Task<IEnumerable<DrugRequestDto>> GetAllAsync(DrugRequestStatus? status = null, int? pharmacyId = null, CancellationToken ct = default);
        Task<DrugRequestDto> ReviewAsync(int requestId, ReviewDrugRequestDto dto, string adminId, CancellationToken ct = default);
    }
}
