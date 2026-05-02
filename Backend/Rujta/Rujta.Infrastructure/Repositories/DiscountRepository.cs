using Rujta.Domain.Enums;

namespace Rujta.Infrastructure.Repositories
{
    public class DiscountRepository : GenericRepository<Discount, int>, IDiscountRepository
    {
        public DiscountRepository(AppDbContext context) : base(context) { }

        public async Task<List<Discount>> GetActiveDiscountsByPharmacyAsync(int pharmacyId)
        {
            var now = DateTime.UtcNow;

            return await _context.Discounts
                .Where(d =>
                    d.PharmacyId == pharmacyId &&
                    d.IsActive &&
                    d.StartDate <= now &&
                    d.EndDate >= now)
                .ToListAsync();
        }

        public async Task<List<Discount>> GetMatchedDiscountsAsync(
            int pharmacyId,
            int medicineId,
            int? categoryId,
            int? companyId)
        {
            var now = DateTime.UtcNow;

            return await _context.Discounts
                .AsNoTracking()
                .Where(d =>
                    d.PharmacyId == pharmacyId &&
                    d.IsActive &&
                    d.StartDate <= now &&
                    d.EndDate >= now &&
                    (
                        (d.Scope == DiscountScope.Medicine && d.MedicineId == medicineId) ||
                        (d.Scope == DiscountScope.Category && d.CategoryId == categoryId) ||
                        (d.Scope == DiscountScope.Company && d.CompanyId == companyId)
                    ))
                .ToListAsync();
        }

        public async Task<bool> HasActiveDiscountAsync(
            int pharmacyId,
            DiscountScope scope,
            int? medicineId,
            int? categoryId,
            int? companyId,
            CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;

            return await _context.Discounts
                .AsNoTracking()
                .AnyAsync(d =>
                    d.PharmacyId == pharmacyId &&
                    d.Scope == scope &&
                    d.IsActive &&
                    d.EndDate >= now &&
                    (
                        (scope == DiscountScope.Medicine && d.MedicineId == medicineId) ||
                        (scope == DiscountScope.Category && d.CategoryId == categoryId) ||
                        (scope == DiscountScope.Company && d.CompanyId == companyId)
                    ),
                    cancellationToken);
        }

        
        public async Task<List<Discount>> GetExpiredActiveDiscountsAsync(DateTime now,CancellationToken cancellationToken = default)
            => await _context.Discounts
                .Where(d => d.IsActive && d.EndDate < now)
                .ToListAsync(cancellationToken);
        
    }
}