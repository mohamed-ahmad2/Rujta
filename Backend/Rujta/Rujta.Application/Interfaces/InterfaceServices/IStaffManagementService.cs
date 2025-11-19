using Rujta.Application.DTOs;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IStaffManagementService : IGenericService<StaffDto>
    {
        Task<IEnumerable<StaffDto>> GetStaffByManagerAsync(Guid managerId, CancellationToken cancellationToken = default);
    }
}
