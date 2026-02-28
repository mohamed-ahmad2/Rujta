using Rujta.Domain.Entities;


namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IOrderRepository : IGenericRepository<Order, int>
    {
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Order?> GetOrderWithItemsAsync(int orderId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Order>> GetAllWithItemsAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Order>> GetOrdersByPharmacyIdAsync(int pharmacyId,CancellationToken cancellationToken = default);
        Task<IEnumerable<Order>> GetOrdersByCustomerAsync(Guid customerId);
        Task<List<int>> GetUserPurchasedMedicineIdsAsync(Guid userId,CancellationToken cancellationToken = default);
    }
}
