namespace Rujta.Application.Interfaces.InterfaceRepositories
{ 
      public interface ISubscriptionRepository : IGenericRepository<Subscription, int>
        {
            Task<Subscription?> GetByPharmacyIdAsync(int pharmacyId);
            Task<IEnumerable<Subscription>> GetAllWithPharmacyAsync();
            Task<List<Subscription>> GetExpiredActiveSubscriptionsAsync(CancellationToken cancellationToken = default);
    }
    }

