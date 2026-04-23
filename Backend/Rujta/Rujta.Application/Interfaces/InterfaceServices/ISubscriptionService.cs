using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface ISubscriptionService
    {
        Task<SubscriptionResult> CreateSubscriptionAsync(int pharmacyId, SubscriptionPlan plan);
        Task<SubscriptionStatusResult> GetStatusAsync(int pharmacyId);
        Task<SubscriptionResult> RenewSubscriptionAsync(int pharmacyId, SubscriptionPlan plan);
        Task<bool> IsActiveAsync(int pharmacyId);
        Task<IEnumerable<PharmacySubscriptionSummary>> GetAllSubscriptionsAsync();
        Task<SubscriptionResult> SetStatusManuallyAsync(int pharmacyId, bool activate);
    }
}
