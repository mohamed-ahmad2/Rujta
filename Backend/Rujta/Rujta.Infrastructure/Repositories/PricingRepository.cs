using Microsoft.EntityFrameworkCore;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Repositories
{
    public class PricingRepository : IPricingRepository
    {
        private readonly AppDbContext _context;

        public PricingRepository(AppDbContext context)
        {
            _context = context;
        }

        // AsNoTracking — for reads (cached)
        public async Task<PricingConfig?> GetAsync(CancellationToken cancellationToken = default)
            => await _context.PricingConfigs
                .AsNoTracking()
                .FirstOrDefaultAsync(cancellationToken);

        // Tracked — for updates
        public async Task<PricingConfig?> GetTrackedAsync(CancellationToken cancellationToken = default)
            => await _context.PricingConfigs
                .FirstOrDefaultAsync(cancellationToken);

        public async Task AddAsync(PricingConfig config, CancellationToken cancellationToken = default)
            => await _context.PricingConfigs.AddAsync(config, cancellationToken);

        public Task UpdateAsync(PricingConfig config, CancellationToken cancellationToken = default)
        {
            _context.PricingConfigs.Update(config);
            return Task.CompletedTask;
        }
    }
}