using Rujta.Application.DTOs.PharmacyDto;

namespace Rujta.Infrastructure.Repositories
{
    public class SuperAdminReposatory : GenericRepository<Admin,Guid>, ISuperAdminRepository
    {


        public SuperAdminReposatory(AppDbContext context)  : base(context)
        {
      
        }


        public async Task<int> GetTotalOrdersAsync(int pharmacyId, CancellationToken cancellationToken)
        {
            return await _context.Orders
                .CountAsync(o => o.PharmacyId == pharmacyId, cancellationToken);
        }
        public async Task<List<PharmacyStatsDto>> GetTopPharmaciesAsync(int count, CancellationToken cancellationToken)
        {
            var result = await _context.Orders
                .GroupBy(o => o.PharmacyId)
                .Select(g => new
                {
                    PharmacyId = g.Key,
                    TotalOrders = g.Count()
                })
                .OrderByDescending(x => x.TotalOrders)
                .Take(count)
                .Join(_context.Pharmacies,
                    orderGroup => orderGroup.PharmacyId,
                    pharmacy => pharmacy.Id,
                    (orderGroup, pharmacy) => new PharmacyStatsDto
                    {
                        PharmacyId = pharmacy.Id,
                        Name = pharmacy.Name,
                        TotalOrders = orderGroup.TotalOrders
                    })
                .ToListAsync(cancellationToken);

            return result;
        }
    }
}
