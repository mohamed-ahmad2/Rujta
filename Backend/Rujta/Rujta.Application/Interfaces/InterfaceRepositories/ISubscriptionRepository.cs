using Rujta.Domain.Entities.Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{ 
      public interface ISubscriptionRepository
        {
            Task<Subscription?> GetByPharmacyIdAsync(int pharmacyId);
            Task AddAsync(Subscription subscription);
        Task<IEnumerable<Subscription>> GetAllWithPharmacyAsync();
    }
    }

