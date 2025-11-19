using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IStaffManagementRepository : IGenericRepository<Staff>
    {
        Task<IEnumerable<Staff>> GetStaffByManagerAsync(Guid managerId, CancellationToken cancellationToken = default);
    }
}
