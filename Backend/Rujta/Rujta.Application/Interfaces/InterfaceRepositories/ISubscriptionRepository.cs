namespace Rujta.Application.Interfaces.InterfaceRepositories
{ 
      public interface ISubscriptionRepository
        {
            Task<Subscription?> GetByPharmacyIdAsync(int pharmacyId);
            Task AddAsync(Subscription subscription);
        Task<IEnumerable<Subscription>> GetAllWithPharmacyAsync();
    }
    }

