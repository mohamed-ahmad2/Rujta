using AutoMapper;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

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

        public async Task<OrderDto> CreateOrderAsync(OrderDto orderDto, CancellationToken cancellationToken)
        {
            var order = _mapper.Map<Order>(orderDto);
            order.OrderDate = DateTime.UtcNow;
            await _unitOfWork.Orders.AddAsync(order, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            return _mapper.Map<OrderDto>(order);
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(Guid userId, CancellationToken cancellationToken)
        {
            var orders = await _unitOfWork.Orders.GetOrdersByUserIdAsync(userId, cancellationToken);
            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task<OrderDto?> GetOrderDetailsAsync(int orderId, CancellationToken cancellationToken)
        {
            var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(orderId, cancellationToken);
            return _mapper.Map<OrderDto?>(order);
        }

    }
}
