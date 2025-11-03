using Rujta.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IOrderService : IGenericService<OrderDto>
    {
        Task<OrderDto> CreateOrderAsync(OrderDto orderDto, CancellationToken cancellationToken = default);
        Task<IEnumerable<OrderDto>> GetUserOrdersAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<OrderDto?> GetOrderDetailsAsync(int orderId, CancellationToken cancellationToken = default);
    }
}
