using Rujta.Application.DTOs.DiscountDtos;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IDiscountService
    {
        Task<Discount?> GetBestDiscountAsync(InventoryItem item);
        Task<decimal> ApplyDiscountAsync(InventoryItem item);
        Task ValidateDiscountScopeAsync(CreateDiscountDto dto, int pharmacyId);
        Task<Discount> CreateDiscountAsync(CreateDiscountDto dto, int pharmacyId);

        Task<IEnumerable<DiscountDto>> GetByPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default);
        Task<DiscountDto?> GetByIdAsync(int id, int pharmacyId, CancellationToken cancellationToken = default);
        Task DeleteAsync(int id, int pharmacyId, CancellationToken cancellationToken = default);
        Task DeactivateAsync(int id, int pharmacyId, CancellationToken cancellationToken = default);
    }
}
