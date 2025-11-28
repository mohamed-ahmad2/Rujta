using Microsoft.EntityFrameworkCore;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class StaffRepository : GenericRepository<Staff>, IStaffRepository
    {
        public StaffRepository(AppDbContext context) : base(context){}

        public async Task<IEnumerable<Staff>> GetStaffByManagerAsync(Guid managerId, CancellationToken cancellationToken = default)
        {
            return await _context.Set<Staff>()
                .Where(s => s.ManagerID == managerId)
                .ToListAsync(cancellationToken);
        }
    }
}
