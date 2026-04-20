// Rujta.Infrastructure/Repositories/AdRepository.cs
using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;          // AppDbContext lives here — matches your AddressRepository

namespace Rujta.Infrastructure.Repositories
{
    public class AdRepository : GenericRepository<Ad, int>, IAdRepository
    {
        private readonly AppDbContext _context;

        public AdRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Ad>> GetAllActiveAsync(
            CancellationToken cancellationToken = default)
        {
            return await _context.Ads
                .Where(a => a.IsActive)
                .OrderByDescending(a => a.CreatedAt)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        /// <inheritdoc/>
        public async Task<IEnumerable<Ad>> GetByPharmacyIdAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            return await _context.Ads
                .Where(a => a.PharmacyId == pharmacyId && a.IsActive)
                .OrderByDescending(a => a.CreatedAt)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

        /// <inheritdoc/>
        public async Task DeactivateAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            var ad = await _context.Ads
                .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

            if (ad is null) return;

            ad.IsActive = false;
            ad.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
        }

        /// <inheritdoc/>
        public async Task SetStatusAsync(
            int id,
            bool isActive,
            CancellationToken cancellationToken = default)
        {
            var ad = await _context.Ads
                .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

            if (ad is null) return;

            ad.IsActive = isActive;
            ad.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
