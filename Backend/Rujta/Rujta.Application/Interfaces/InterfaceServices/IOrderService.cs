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
        Task<(bool success, string message)> AcceptOrderAsync(int id, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> CancelOrderByUserAsync(int id, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> CancelOrderByPharmacyAsync(int id, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> ProcessOrderAsync(int id, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> OutForDeliveryAsync(int id, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> MarkAsDeliveredAsync(int id, CancellationToken cancellationToken = default);
    }
}
