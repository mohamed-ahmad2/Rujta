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

        public async Task<List<Discount>> GetMatchedDiscountsAsync(int pharmacyId,int medicineId,int? categoryId,int? companyId)
        {
            var now = DateTime.UtcNow;

            return await _context.Discounts
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
    }
}
