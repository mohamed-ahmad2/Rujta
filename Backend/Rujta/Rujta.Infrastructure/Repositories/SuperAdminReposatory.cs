using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs.PharmacyDto;

namespace Rujta.Infrastructure.Repositories
{
    public class SuperAdminRepository : GenericRepository<Admin, Guid>, ISuperAdminRepository
    {
        public SuperAdminRepository(AppDbContext context) : base(context) { }

        public Task<int> GetTotalOrdersAsync(int pharmacyId, CancellationToken cancellationToken)
            => _context.Orders.CountAsync(o => o.PharmacyId == pharmacyId, cancellationToken);

        public async Task<List<PharmacyStatsDto>> GetTopPharmaciesAsync(int count, CancellationToken cancellationToken)
        {
            return await _context.Orders
                .GroupBy(o => o.PharmacyId)
                .Select(g => new { PharmacyId = g.Key, TotalOrders = g.Count() })
                .OrderByDescending(x => x.TotalOrders)
                .Take(count)
                .Join(_context.Pharmacies,
                    og => og.PharmacyId,
                    ph => ph.Id,
                    (og, ph) => new PharmacyStatsDto
                    {
                        PharmacyId = ph.Id,
                        Name = ph.Name,
                        TotalOrders = og.TotalOrders
                    })
                .ToListAsync(cancellationToken);
        }


        public async Task<Dictionary<int, int>> GetTotalOrdersForPharmaciesAsync(List<int> pharmacyIds, CancellationToken cancellationToken = default)
        {
            return await _context.Orders
                .Where(o => pharmacyIds.Contains(o.PharmacyId))
                .GroupBy(o => o.PharmacyId)
                .Select(g => new
                {
                    PharmacyId = g.Key,
                    Count = g.Count()
                })
                .ToDictionaryAsync(x => x.PharmacyId, x => x.Count, cancellationToken);
        }
    }
}