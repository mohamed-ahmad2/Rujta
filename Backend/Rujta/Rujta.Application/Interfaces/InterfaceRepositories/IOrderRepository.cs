using Rujta.Domain.Entities;


namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Order?> GetOrderWithItemsAsync(int orderId, CancellationToken cancellationToken = default);
        Task<IEnumerable<Order>> GetAllWithItemsAsync(CancellationToken cancellationToken = default);
    }
}
