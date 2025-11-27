using Rujta.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IStaffManagementService : IGenericService<StaffDto>
    {
        Task<IEnumerable<StaffDto>> GetStaffByManagerAsync(Guid managerId, CancellationToken cancellationToken = default);
    }
}
