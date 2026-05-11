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

        public async Task<List<Subscription>> GetExpiredActiveSubscriptionsAsync(CancellationToken cancellationToken = default)
            => await _context.Subscriptions
                .Include(s => s.Pharmacy)
                .Where(s => s.Status == SubscriptionStatus.Active && s.EndDate < DateTime.UtcNow)
                .ToListAsync(cancellationToken);


        public async Task ActivateAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.Pharmacy)
                .FirstOrDefaultAsync(s => s.PharmacyId == pharmacyId, cancellationToken);

            if (subscription is null) return;

            subscription.Status = SubscriptionStatus.Active;

            if (subscription.Pharmacy is not null)
                subscription.Pharmacy.IsActive = true;

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}