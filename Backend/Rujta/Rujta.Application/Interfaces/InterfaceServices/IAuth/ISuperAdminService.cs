using Rujta.Application.DTOs.PharmacyDto;
using Rujta.Application.DTOs.PharmacyDtos;

namespace Rujta.Application.Interfaces.InterfaceServices.IAuth
{
    public interface ISuperAdminService
    {
        Task<CreatePharmacyResultDto> CreatePharmacyAsync(CreatePharmacyDto dto, Guid adminId, CancellationToken cancellationToken = default);
        Task<IEnumerable<PharmacyDto>> GetAllPharmaciesAsync(CancellationToken cancellationToken = default);
        Task<PharmacyDto?> GetPharmacyByIdAsync(int pharmacyId, CancellationToken cancellationToken = default);
        Task<PharmacyDto> UpdatePharmacyAsync(int pharmacyId, UpdatePharmacyDto dto, CancellationToken cancellationToken = default);

        Task<string> ResetPharmacyManagerPasswordAsync(int pharmacyId, CancellationToken cancellationToken = default);

        Task<int> GetPharmacyTotalOrdersAsync(int pharmacyId, CancellationToken cancellationToken = default);
        Task<List<PharmacyStatsDto>> GetTopPharmaciesAsync(int count, CancellationToken cancellationToken = default);
        Task<bool> DeletePharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default);
        Task<bool> RestorePharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default);

        Task<IEnumerable<PharmacyDto>> GetMainPharmaciesAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<BranchDto>> GetBranchesAsync(int parentId, CancellationToken cancellationToken = default);
        Task<PharmacyTreeDto?> GetPharmacyTreeAsync(int rootId, CancellationToken cancellationToken = default);
        Task<bool> DetachBranchAsync(int branchId, CancellationToken cancellationToken = default);
        Task<bool> AttachBranchAsync(int branchId, int parentId, CancellationToken cancellationToken = default);
    }
}