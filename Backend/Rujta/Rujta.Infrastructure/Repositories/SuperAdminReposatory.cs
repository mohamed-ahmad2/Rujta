using Rujta.Application.DTOs.PharmacyDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class SuperAdminReposatory : ISuperAdminRepository
    {
        private readonly AppDbContext _context;

        public SuperAdminReposatory(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Pharmacy pharmacy, CancellationToken cancellationToken)
        {
            await _context.Pharmacies.AddAsync(pharmacy, cancellationToken);
        }

        public async Task<Pharmacy?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _context.Pharmacies
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Pharmacy>> GetAllAsync(CancellationToken cancellationToken)
        {
            return await _context.Pharmacies.ToListAsync(cancellationToken);
        }

        // 🔥 NEW
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
