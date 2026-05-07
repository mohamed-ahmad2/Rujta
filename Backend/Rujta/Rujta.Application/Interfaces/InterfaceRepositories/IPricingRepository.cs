using Rujta.Domain.Entities;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IPricingRepository
    {
        Task<PricingConfig?> GetAsync(CancellationToken cancellationToken = default);
        Task<PricingConfig?> GetTrackedAsync(CancellationToken cancellationToken = default);
        Task AddAsync(PricingConfig config, CancellationToken cancellationToken = default);
        Task UpdateAsync(PricingConfig config, CancellationToken cancellationToken = default);
    }
}