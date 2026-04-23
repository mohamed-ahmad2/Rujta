using Microsoft.EntityFrameworkCore;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using Rujta.Domain.Entities.Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;


namespace Rujta.Infrastructure.Repositories
{
    public class SubscriptionRepository : ISubscriptionRepository
    {
        private readonly AppDbContext _context;

        public SubscriptionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Subscription?> GetByPharmacyIdAsync(int pharmacyId)
            => await _context.Subscriptions
                .Include(s => s.Pharmacy)
                .FirstOrDefaultAsync(s => s.PharmacyId == pharmacyId);

        public async Task AddAsync(Subscription subscription)
            => await _context.Subscriptions.AddAsync(subscription);
        public async Task<IEnumerable<Subscription>> GetAllWithPharmacyAsync()
    => await _context.Subscriptions
        .Include(s => s.Pharmacy)
        .OrderBy(s => s.Status)
        .ToListAsync();
    }
}