using Microsoft.EntityFrameworkCore;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class InventoryRepository : GenericRepository<InventoryItem>, IInventoryRepository
    {
        

        public InventoryRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<InventoryItem>> GetByPharmacyAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            return await _context.InventoryItems
                .Include(i => i.Medicine)
                .Where(i => i.PharmacyID == pharmacyId)
                .ToListAsync(cancellationToken);
        }

        public async Task<bool> ExistsAsync(
            int id,
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            return await _context.InventoryItems
                .AnyAsync(i => i.Id == id && i.PharmacyID == pharmacyId, cancellationToken);
        }
    }
}
