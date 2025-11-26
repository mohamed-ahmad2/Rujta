using AutoMapper;
using Rujta.Application.Constants;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;

namespace Rujta.Application.Services
{
    public class OrderService : IOrderService
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
                return (false, OrderMessages.OrderNotFound);

            if (!CanChangeStatus(order.Status, OrderStatus.Accepted))
                return (false, OrderMessages.InvalidStateTransition);

            order.Status = OrderStatus.Accepted;
            await _unitOfWork.SaveAsync(cancellationToken);
            return (true, OrderMessages.OrderAccepted);

        }

        public async Task<(bool success, string message)> CancelOrderByUserAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
            if (order == null)
                return (false, OrderMessages.OrderNotFound);

            if (!CanChangeStatus(order.Status, OrderStatus.CancelledByUser))
                return (false, OrderMessages.InvalidStateTransition);

            order.Status = OrderStatus.CancelledByUser;
            await _unitOfWork.SaveAsync(cancellationToken);
            return (true, OrderMessages.OrderCancelByUser);

        }

        public async Task<(bool success, string message)> CancelOrderByPharmacyAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
            if (order == null)
                return (false, OrderMessages.OrderNotFound);

            if (!CanChangeStatus(order.Status, OrderStatus.CancelledByPharmacy))
                return (false, OrderMessages.InvalidStateTransition);
            order.Status = OrderStatus.CancelledByPharmacy;
            await _unitOfWork.SaveAsync(cancellationToken);
            return (true, OrderMessages.OrderCancelByPharmacy);

        }

        public async Task<(bool success, string message)> ProcessOrderAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null) return (false, OrderMessages.OrderNotFound);

            if (!CanChangeStatus(order.Status, OrderStatus.Processing))
                return (false, OrderMessages.InvalidStateTransition);

            order.Status = OrderStatus.Processing;
            await _unitOfWork.SaveAsync(cancellationToken);
            return (true, OrderMessages.OrderProcessNow);

        }

        public async Task<(bool success, string message)> OutForDeliveryAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null) return (false, OrderMessages.OrderNotFound);

            if (!CanChangeStatus(order.Status, OrderStatus.OutForDelivery))
                return (false, OrderMessages.InvalidStateTransition);

            order.Status = OrderStatus.OutForDelivery;
            await _unitOfWork.SaveAsync(cancellationToken);
            return (true, OrderMessages.OrderOutForDelivery);

        }

        public async Task<(bool success, string message)> MarkAsDeliveredAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id);
            if (order == null) return (false, OrderMessages.OrderNotFound);

            if (!CanChangeStatus(order.Status, OrderStatus.Delivered))
                return (false, OrderMessages.InvalidStateTransition);

            order.Status = OrderStatus.Delivered;
            await _unitOfWork.SaveAsync(cancellationToken);
            return (true, OrderMessages.OrderMarkAsDelivered);

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

        public async Task<IEnumerable<OrderDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var orders = await _unitOfWork.Orders.GetAllAsync(cancellationToken);
            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task<OrderDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
            return order is null ? null : _mapper.Map<OrderDto>(order);
        }

        public async Task AddAsync(OrderDto dto, CancellationToken cancellationToken = default)
        {
            var order = _mapper.Map<Order>(dto);
            await _unitOfWork.Orders.AddAsync(order, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task UpdateAsync(int id, OrderDto dto, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
            if (order == null) return;

            _mapper.Map(dto, order);
            await _unitOfWork.Orders.UpdateAsync(order, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
            if (order == null) return;

            await _unitOfWork.Orders.DeleteAsync(order, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
        }

        private static bool CanChangeStatus(OrderStatus current, OrderStatus next)
        {
            return (current, next) switch
            {
                (OrderStatus.Pending, OrderStatus.Accepted) => true,
                (OrderStatus.Accepted, OrderStatus.Processing) => true,
                (OrderStatus.Processing, OrderStatus.OutForDelivery) => true,
                (OrderStatus.OutForDelivery, OrderStatus.Delivered) => true,
                (OrderStatus.Pending or OrderStatus.Accepted, OrderStatus.CancelledByUser) => true,
                (OrderStatus.Pending or OrderStatus.Accepted, OrderStatus.CancelledByPharmacy) => true,
                _ => false
            };
        }

    }
}
