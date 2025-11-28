using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IStaffRepository : IGenericRepository<Staff>
    {
        Task<IEnumerable<Staff>> GetStaffByManagerAsync(Guid managerId, CancellationToken cancellationToken = default);
    }
}
