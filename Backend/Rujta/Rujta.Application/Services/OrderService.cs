using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;
using System.Threading;

namespace Rujta.Application.Services
{
    public class OrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public OrderService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<OrderDto> CreateOrderAsync(OrderDto orderDto, CancellationToken cancellationToken = default)
        {
            var order = _mapper.Map<Order>(orderDto);
            order.OrderDate = DateTime.UtcNow;
            order.Status = OrderStatus.Pending;

            await _unitOfWork.Orders.AddAsync(order, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            return _mapper.Map<OrderDto>(order);
        }

        public async Task<(bool success, string message)> AcceptOrderAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
            if (order == null)
                return (false, "Order not found.");

            if(order.Status == OrderStatus.Pending)
            {
                order.Status = OrderStatus.Accepted;
                await _unitOfWork.SaveAsync(cancellationToken);
                return (true, "Order accepted.");
            }
            return (false, "Cannot accept this order now.");
        }

        public async Task<(bool success, string message)> CancelOrderByUserAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
            if (order == null)
                return (false, "Order not found.");

            if (order.Status == OrderStatus.Pending || order.Status == OrderStatus.Accepted)
            {
                order.Status = OrderStatus.CancelledByUser;
                await _unitOfWork.SaveAsync(cancellationToken);
                return (true, "Order Cancel By User");
            }

            return (false, "Cannot cancel this order now.");
        }

        public async Task<(bool success, string message)> CancelOrderByPharmacyAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
            if (order == null)
                return (false, "Order not found.");

            if (order.Status == OrderStatus.Pending || order.Status == OrderStatus.Accepted)
            {
                order.Status = OrderStatus.CancelledByPharmacy;
                await _unitOfWork.SaveAsync(cancellationToken);
                return (true, "Order Cancel By Pharmacy");
            }

            return (false, "Cannot cancel this order now.");
        }

        public async Task<(bool success, string message)> ProcessOrderAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null) return (false, "Order not found.");

            if (order.Status == OrderStatus.Accepted)
            {
                order.Status = OrderStatus.Processing;
                await _unitOfWork.SaveAsync(cancellationToken);
                return (true, "Order procces now.");
            }
            return (false, "Cannot procces this order now.");
        }

        public async Task<(bool success, string message)> OutForDeliveryAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null) return (false, "Order not found.");

            if (order.Status == OrderStatus.Processing)
            {
                order.Status = OrderStatus.OutForDelivery;
                await _unitOfWork.SaveAsync(cancellationToken);
                return (true, "Order out for delivery now.");
            }
            return (false, "Cannot out for delivery this order now.");
        }

        public async Task<(bool success, string message)> MarkAsDeliveredAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null) return (false, "Order not found.");

            if (order.Status == OrderStatus.OutForDelivery)
            {
                order.Status = OrderStatus.Delivered;
                await _unitOfWork.SaveAsync(cancellationToken);
                return (true, "Order mark as delivered now.");
            }
            return (false, "Cannot mark as delivered this order now.");
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var orders = await _unitOfWork.Orders.GetOrdersByUserIdAsync(userId, cancellationToken);
            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task<OrderDto?> GetOrderDetailsAsync(int orderId, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(orderId, cancellationToken);
            return _mapper.Map<OrderDto?>(order);
        }

    }
}
