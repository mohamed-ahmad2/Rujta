using Microsoft.EntityFrameworkCore;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Repositories
{
    public class StaffManagementRepository : GenericRepository<Staff>, IStaffManagementRepository
    {
        public StaffManagementRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Staff>> GetStaffByManagerAsync(Guid managerId, CancellationToken cancellationToken = default)
        {
            return await _context.Set<Staff>()
                                 .Where(s => s.ManagerID == managerId)
                                 .ToListAsync(cancellationToken);
        }
    }
}
