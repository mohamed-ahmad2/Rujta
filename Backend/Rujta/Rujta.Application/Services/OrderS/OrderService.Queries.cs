using Rujta.Application.DTOs.OrderDto;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService
    {
        public async Task<IEnumerable<OrderDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching all orders");
                var orders = await _unitOfWork.Orders.GetAllWithItemsAsync(cancellationToken);
                return _mapper.Map<IEnumerable<OrderDto>>(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching all orders");
                throw new InvalidOperationException("An error occurred while fetching all orders.", ex);
            }
        }

        public async Task<OrderDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching Order by Id {OrderId}", id);
                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                return order is null ? null : _mapper.Map<OrderDto>(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching Order {OrderId}", id);
                throw new InvalidOperationException($"An error occurred while fetching Order {id}.", ex);
            }
        }

        public async Task<OrderDto?> GetOrderDetailsAsync(
            int orderId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching details for Order {OrderId}", orderId);
                var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(orderId, cancellationToken);
                return _mapper.Map<OrderDto?>(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get details for Order {OrderId}", orderId);
                throw new InvalidOperationException(
                    $"An error occurred while fetching details for Order {orderId}.", ex);
            }
        }

        public async Task<IEnumerable<OrderDto>> GetPharmacyOrdersAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching orders for Pharmacy {PharmacyId}", pharmacyId);
                var orders = await _unitOfWork.Orders.GetOrdersByPharmacyIdAsync(pharmacyId, cancellationToken);
                return _mapper.Map<IEnumerable<OrderDto>>(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch orders for Pharmacy {PharmacyId}", pharmacyId);
                throw new InvalidOperationException(
                    $"An error occurred while fetching orders for Pharmacy {pharmacyId}.", ex);
            }
        }

        public async Task<IEnumerable<List<OrderDto>>> GetUserOrdersGroupedAsync(
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            var orders = await _unitOfWork.Orders.GetOrdersByUserIdAsync(userId, cancellationToken);
            var sorted = _mapper.Map<IEnumerable<OrderDto>>(orders)
                                .OrderBy(o => o.OrderDate)
                                .ToList();

            var groups = new List<List<OrderDto>>();
            var currentGroup = new List<OrderDto>();

            foreach (var order in sorted)
            {
                if (currentGroup.Count == 0)
                {
                    currentGroup.Add(order);
                }
                else
                {
                    var diffMinutes = (order.OrderDate - currentGroup.Last().OrderDate).TotalMinutes;

                    if (diffMinutes <= 1)
                        currentGroup.Add(order);
                    else
                    {
                        groups.Add(new List<OrderDto>(currentGroup));
                        currentGroup.Clear();
                        currentGroup.Add(order);
                    }
                }
            }

            if (currentGroup.Count > 0)
                groups.Add(currentGroup);

            return groups;
        }

        public async Task<bool> CanAccessOrderAsync(int orderId, string? userId, string? pharmacyId)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(orderId);

            if (order == null) return false;

            return order.UserId.ToString() == userId ||
                   order.PharmacyId.ToString() == pharmacyId;
        }
    }
}