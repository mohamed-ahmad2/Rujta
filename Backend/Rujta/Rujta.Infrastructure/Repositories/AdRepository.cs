// Rujta.Infrastructure/Repositories/AdRepository.cs
namespace Rujta.Infrastructure.Repositories
{
    public class AdRepository : GenericRepository<Ad, int>, IAdRepository
    {

        public AdRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Ad>> GetAllActiveAsync(
            CancellationToken cancellationToken = default)
        {
            return await _context.Ads
                .Where(a => a.IsActive)
                .OrderByDescending(a => a.CreatedAt)
                .AsNoTracking()
                .ToListAsync(cancellationToken);
        }

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

        public async Task ActivateAsync(int adId, int durationDays, CancellationToken cancellationToken = default)
        {
            var ad = await _context.Ads.FindAsync([adId], cancellationToken);
            if (ad == null) return;

            ad.IsActive = true;
            ad.StartsAt = DateTime.UtcNow;
            ad.ExpiresAt = DateTime.UtcNow.AddDays(durationDays);
            ad.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
        }
        public async Task<List<Ad>> GetExpiredActiveAdsAsync(DateTime now, CancellationToken cancellationToken = default)
        {
            return await _context.Ads
                .Where(a => a.IsActive && a.ExpiresAt.HasValue && a.ExpiresAt.Value < now)
                .ToListAsync(cancellationToken);
        }
    }
}
