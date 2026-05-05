using Rujta.Application.DTOs.PharmacyDto;
using Rujta.Application.DTOs.SubscriptionDto;

namespace Rujta.Application.Services
{
    public class SubscriptionService(IUnitOfWork _uow) : ISubscriptionService
    {
        public async Task<SubscriptionResult> CreateSubscriptionAsync(int pharmacyId, SubscriptionPlan plan)
        {
            var existing = await _uow.Subscriptions.GetByPharmacyIdAsync(pharmacyId);
            if (existing is not null)
                return SubscriptionResult.Fail("Pharmacy already has a subscription. Use renew instead.");

            var pharmacy = await _uow.Pharmacies.GetByIdAsync(pharmacyId);
            if (pharmacy is null)
                return SubscriptionResult.Fail("Pharmacy not found.");

            var (start, end) = CalculateDates(plan);

            var subscription = new Subscription
            {
                PharmacyId = pharmacyId,
                Plan = plan,
                Status = SubscriptionStatus.Active,
                StartDate = start,
                EndDate = end
            };

            pharmacy.IsActive = true;

            await _uow.Subscriptions.AddAsync(subscription);
            await _uow.SaveAsync();

            return SubscriptionResult.Ok(start, end);
        }

        public async Task<SubscriptionStatusResult> GetStatusAsync(int pharmacyId)
        {
            var subscription = await _uow.Subscriptions.GetByPharmacyIdAsync(pharmacyId);

            if (subscription is null)
                return new SubscriptionStatusResult { Found = false };

            var now = DateTime.UtcNow;

            if (subscription.Status == SubscriptionStatus.Active && subscription.EndDate < now)
            {
                subscription.Status = SubscriptionStatus.Expired;

                if (subscription.Pharmacy is not null)
                    subscription.Pharmacy.IsActive = false;

                await _uow.SaveAsync();
            }

            return new SubscriptionStatusResult
            {
                Found = true,
                Status = subscription.Status,
                Plan = subscription.Plan,
                StartDate = subscription.StartDate,
                EndDate = subscription.EndDate,
                DaysRemaining = subscription.Status == SubscriptionStatus.Active
                    ? Math.Max(0, (subscription.EndDate - now).Days)
                    : 0
            };
        }

        public async Task<SubscriptionResult> RenewSubscriptionAsync(int pharmacyId, SubscriptionPlan plan)
        {
            var subscription = await _uow.Subscriptions.GetByPharmacyIdAsync(pharmacyId);

            if (subscription is null)
                return SubscriptionResult.Fail("No subscription found. Please create one first.");

            var (start, end) = CalculateDates(plan);

            subscription.Plan = plan;
            subscription.Status = SubscriptionStatus.Active;
            subscription.StartDate = start;
            subscription.EndDate = end;

            if (subscription.Pharmacy is not null)
                subscription.Pharmacy.IsActive = true;

            await _uow.SaveAsync();

            return SubscriptionResult.Ok(start, end);
        }

        public async Task<bool> IsActiveAsync(int pharmacyId)
        {
            var result = await GetStatusAsync(pharmacyId);
            return result.Found && result.Status == SubscriptionStatus.Active;
        }

        public async Task<IEnumerable<PharmacySubscriptionSummary>> GetAllSubscriptionsAsync()
        {
            var subscriptions = await _uow.Subscriptions.GetAllWithPharmacyAsync();
            var now = DateTime.UtcNow;
            var hasChanges = false;

            foreach (var s in subscriptions)
            {
                if (s.Status == SubscriptionStatus.Active && s.EndDate < now)
                {
                    s.Status = SubscriptionStatus.Expired;

                    if (s.Pharmacy is not null)
                        s.Pharmacy.IsActive = false;

                    hasChanges = true;
                }
            }

            if (hasChanges)
                await _uow.SaveAsync();

            return subscriptions.Select(s => new PharmacySubscriptionSummary
            {
                PharmacyId = s.PharmacyId,
                PharmacyName = s.Pharmacy?.Name ?? "Unknown",
                PharmacyIsActive = s.Pharmacy?.IsActive ?? false,
                SubscriptionStatus = s.Status,
                Plan = s.Plan,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                DaysRemaining = s.Status == SubscriptionStatus.Active
                    ? Math.Max(0, (s.EndDate - now).Days)
                    : 0
            });
        }

        public async Task<SubscriptionResult> SetStatusManuallyAsync(int pharmacyId, bool activate)
        {
            var subscription = await _uow.Subscriptions.GetByPharmacyIdAsync(pharmacyId);

            if (subscription is null)
                return SubscriptionResult.Fail("No subscription found for this pharmacy.");

            subscription.Status = activate
                ? SubscriptionStatus.Active
                : SubscriptionStatus.Expired;

            if (subscription.Pharmacy is not null)
                subscription.Pharmacy.IsActive = activate;

            await _uow.SaveAsync();

            return SubscriptionResult.Ok(subscription.StartDate, subscription.EndDate);
        }

        private static (DateTime start, DateTime end) CalculateDates(SubscriptionPlan plan)
        {
            var start = DateTime.UtcNow;
            var end = plan == SubscriptionPlan.Yearly
                ? start.AddYears(1)
                : start.AddMonths(1);
            return (start, end);
        }
    }
}