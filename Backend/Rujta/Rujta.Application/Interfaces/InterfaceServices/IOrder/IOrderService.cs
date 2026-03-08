using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices.IGenericS;
using Rujta.Domain.Entities;

namespace Rujta.Application.Interfaces.InterfaceServices.IOrder
{
    public interface IOrderService : IGenericService<OrderDto, int>
    {
        Task<OrderDto> CreateOrderAsync(CreateOrderDto createOrderDto, Guid userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<List<OrderDto>>> GetUserOrdersGroupedAsync(Guid userId, CancellationToken cancellationToken = default);
        Task<OrderDto?> GetOrderDetailsAsync(int orderId, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> AcceptOrderAsync(int id, int pharmacyId, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> CancelOrderByUserAsync(int id, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> CancelOrderByPharmacyAsync(int id, int pharmacyId, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> ProcessOrderAsync(int id, int pharmacyId, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> OutForDeliveryAsync(int id, int pharmacyId, CancellationToken cancellationToken = default);
        Task<(bool success, string message)> MarkAsDeliveredAsync(int id, int pharmacyId, CancellationToken cancellationToken = default);
        Task<IEnumerable<OrderDto>> GetPharmacyOrdersAsync(int pharmacyId,CancellationToken cancellationToken = default);
        Task<bool> CanAccessOrderAsync(int orderId,string? userId,string? pharmacyId);
    }
}
