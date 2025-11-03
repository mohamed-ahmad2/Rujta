using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
        Task<IEnumerable<Order>> GetOrdersByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<Order?> GetOrderWithItemsAsync(int orderId, CancellationToken cancellationToken = default);
    }
}
