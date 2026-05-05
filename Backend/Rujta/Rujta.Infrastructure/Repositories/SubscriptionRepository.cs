using Rujta.Domain.Enums;

namespace Rujta.Infrastructure.Repositories
{
    public class SubscriptionRepository : GenericRepository<Subscription, int>,ISubscriptionRepository
    {


        public SubscriptionRepository(AppDbContext context) : base(context)
        {
  
        }

        public async Task<Subscription?> GetByPharmacyIdAsync(int pharmacyId)
            => await _context.Subscriptions
                .Include(s => s.Pharmacy)
                .FirstOrDefaultAsync(s => s.PharmacyId == pharmacyId);

        public async Task<IEnumerable<Subscription>> GetAllWithPharmacyAsync()
            => await _context.Subscriptions
                .Include(s => s.Pharmacy)
                .OrderBy(s => s.Status)
                .ToListAsync();

        public async Task<List<Subscription>> GetExpiredActiveSubscriptionsAsync(CancellationToken ct = default)
            => await _context.Subscriptions
                .Include(s => s.Pharmacy)
                .Where(s => s.Status == SubscriptionStatus.Active && s.EndDate < DateTime.UtcNow)
                .ToListAsync(ct);
    }
}