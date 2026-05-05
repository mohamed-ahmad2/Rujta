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

        public async Task AddAsync(Subscription subscription)
            => await _context.Subscriptions.AddAsync(subscription);
        public async Task<IEnumerable<Subscription>> GetAllWithPharmacyAsync()
    => await _context.Subscriptions
        .Include(s => s.Pharmacy)
        .OrderBy(s => s.Status)
        .ToListAsync();
    }
}