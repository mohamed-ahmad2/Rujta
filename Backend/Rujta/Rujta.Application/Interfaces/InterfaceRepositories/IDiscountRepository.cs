namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IDiscountRepository : IGenericRepository<Discount, int>
    {
        Task<List<Discount>> GetActiveDiscountsByPharmacyAsync(int pharmacyId);
        Task<List<Discount>> GetMatchedDiscountsAsync(int pharmacyId,int medicineId,int? categoryId,int? companyId);
    }
}
