using Microsoft.EntityFrameworkCore;

namespace Rujta.Application.Services
{
    public class OrderService(IUnitOfWork _unitOfWork,IMapper _mapper,ILogger<OrderService> _logger) : IOrderService
    {
        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto createOrderDto, Guid userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Creating new order for UserId {UserId}", userId);

                var appUser = await _unitOfWork.People.GetByGuidAsync(userId, cancellationToken)
                    ?? throw new InvalidOperationException($"User with ID {userId} not found.");

                var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(createOrderDto.PharmacyID, cancellationToken)
                    ?? throw new InvalidOperationException($"Pharmacy with ID {createOrderDto.PharmacyID} not found.");

                if (!createOrderDto.DeliveryAddressId.HasValue)
                    throw new InvalidOperationException("Delivery address ID is required.");
                

                var address = await _unitOfWork.Address.GetByIdAsync(createOrderDto.DeliveryAddressId.Value, cancellationToken);

                if (address == null)
                    throw new InvalidOperationException("The delivery address does not exist.");
                

                string street = address.Street ?? "";
                string buildingNo = address.BuildingNo ?? "";
                string city = address.City ?? "";
                string governorate = address.Governorate ?? "";

                string DeliveryAddressText = $"{street} {buildingNo}".Trim();
                if (!string.IsNullOrEmpty(city) || !string.IsNullOrEmpty(governorate))
                {
                    DeliveryAddressText += $"\n{city} {governorate}".Trim();
                }

                var order = new Order
                {
                    UserId = userId,
                    PharmacyId = createOrderDto.PharmacyID,
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,
                    DeliveryAddress = DeliveryAddressText,
                    OrderItems = new List<OrderItem>()
                };

                decimal totalPrice = 0;
                var medicineIds = createOrderDto.OrderItems.Select(i => i.MedicineID).ToList();
                var medicines = await _unitOfWork.InventoryItems.FindAsync(m => medicineIds.Contains(m.Id), cancellationToken);
                var medicineDict = medicines.ToDictionary(m => m.Id);

                foreach (var itemDto in createOrderDto.OrderItems)
                {
                    if (!medicineDict.TryGetValue(itemDto.MedicineID, out var medicine))
                        throw new InvalidOperationException($"Medicine with ID {itemDto.MedicineID} not found.");

                    var orderItem = new OrderItem
                    {
                        MedicineID = medicine.Id,
                        Quantity = itemDto.Quantity,
                        PricePerUnit = medicine.Price,
                        SubTotal = itemDto.Quantity * medicine.Price
                    };

                    order.OrderItems.Add(orderItem);
                    totalPrice += orderItem.SubTotal;
                }

                order.TotalPrice = totalPrice;

                await _unitOfWork.Orders.AddAsync(order, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} created successfully for UserId {UserId}", order.Id.ToString(), userId.ToString());

                var orderDto = _mapper.Map<OrderDto>(order);
                orderDto.UserName = appUser.Name;
                orderDto.PharmacyName = pharmacy.Name;

                return orderDto;
            }
            catch (Exception ex)
            {
                var message = $"Failed to create order for UserId {userId}";
                _logger.LogError(ex, message);
                throw new InvalidOperationException(message, ex);
            }
        }

        private async Task<(bool success, string message)> SafeUpdateOrderAsync(int id, OrderStatus newStatus, CancellationToken cancellationToken = default, int maxRetries = 3)
        {
            int retryCount = 0;
            while (retryCount < maxRetries)
            {
                try
                {
                    var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                    if (order == null)
                        return (false, OrderMessages.OrderNotFound);

                    if (!CanChangeStatus(order.Status, newStatus))
                        return (false, OrderMessages.InvalidStateTransition);

                    order.Status = newStatus;

                    try
                    {
                        await _unitOfWork.SaveAsync(cancellationToken);
                        return (true, newStatus switch
                        {
                            OrderStatus.Accepted => OrderMessages.OrderAccepted,
                            OrderStatus.CancelledByUser => OrderMessages.OrderCancelByUser,
                            OrderStatus.CancelledByPharmacy => OrderMessages.OrderCancelByPharmacy,
                            OrderStatus.Processing => OrderMessages.OrderProcessNow,
                            OrderStatus.OutForDelivery => OrderMessages.OrderOutForDelivery,
                            OrderStatus.Delivered => OrderMessages.OrderMarkAsDelivered,
                            _ => "Status updated successfully"
                        });
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        _logger.LogWarning("Concurrency conflict when updating Order {OrderId}. Retry {RetryCount}", id, retryCount + 1);
                        retryCount++;
                        if (retryCount >= maxRetries)
                        {
                            return (false, "Order was modified by another user. Please refresh and try again after multiple attempts.");
                        }

                        await Task.Delay(100 * retryCount, cancellationToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating order {OrderId}", id);
                    return (false, "An unexpected error occurred");
                }
            }
            return (false, "Maximum retries exceeded due to concurrency conflicts.");
        }


        public Task<(bool success, string message)> AcceptOrderAsync(int id, CancellationToken cancellationToken = default) =>
           SafeUpdateOrderAsync(id, OrderStatus.Accepted, cancellationToken);


        public Task<(bool success, string message)> CancelOrderByUserAsync(int id, CancellationToken cancellationToken = default) =>
            SafeUpdateOrderAsync(id, OrderStatus.CancelledByUser, cancellationToken);


        public Task<(bool success, string message)> CancelOrderByPharmacyAsync(int id, CancellationToken cancellationToken = default) =>
            SafeUpdateOrderAsync(id, OrderStatus.CancelledByPharmacy, cancellationToken);

        public Task<(bool success, string message)> ProcessOrderAsync(int id, CancellationToken cancellationToken = default) =>
            SafeUpdateOrderAsync(id, OrderStatus.Processing, cancellationToken);

        public Task<(bool success, string message)> OutForDeliveryAsync(int id, CancellationToken cancellationToken = default) =>
            SafeUpdateOrderAsync(id, OrderStatus.OutForDelivery, cancellationToken);


        public async Task<(bool success, string message)> MarkAsDeliveredAsync(int id,CancellationToken cancellationToken = default)
        {
            await using var transaction =
                await _unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                _logger.LogInformation("Marking Order {OrderId} as Delivered", id);

                var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(id, cancellationToken);

                if (order == null)
                    return (false, OrderMessages.OrderNotFound);

                if (!CanChangeStatus(order.Status, OrderStatus.Delivered))
                    return (false, OrderMessages.InvalidStateTransition);

                foreach (var item in order.OrderItems)
                {
                    var inventoryItem =
                        await _unitOfWork.InventoryItems.GetByMedicineAndPharmacyAsync(
                                item.MedicineID,
                                order.PharmacyId,
                                cancellationToken);

                    if (inventoryItem == null)
                        return (false, "Inventory item not found");

                    if (inventoryItem.Quantity < item.Quantity)
                        return (false, "Insufficient stock to deliver order");

                    inventoryItem.Quantity -= item.Quantity;

                    if (inventoryItem.Quantity == 0)
                        inventoryItem.Status = ProductStatus.OutOfStock;

                    await _unitOfWork.InventoryItems.UpdateAsync(inventoryItem);
                }

                order.Status = OrderStatus.Delivered;

                try
                {
                    await _unitOfWork.SaveAsync(cancellationToken);
                    await transaction.CommitAsync(cancellationToken);
                    return (true, OrderMessages.OrderMarkAsDelivered);
                }
                catch (DbUpdateConcurrencyException)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    _logger.LogWarning("Concurrency conflict when delivering Order {OrderId}", id);
                    return (false, "Order was modified by another user. Please refresh and try again.");
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.LogError(ex, "Error delivering Order {OrderId}", id);
                return (false, "An unexpected error occurred");
            }
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching orders for User {UserId}", userId);

                var orders = await _unitOfWork.Orders.GetOrdersByUserIdAsync(userId, cancellationToken);
                return _mapper.Map<IEnumerable<OrderDto>>(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get orders for User {UserId}", userId);
                throw new InvalidOperationException($"An error occurred while fetching orders for User {userId}.", ex);
            }
        }


        public async Task<OrderDto?> GetOrderDetailsAsync(int orderId, CancellationToken cancellationToken = default)
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
                throw new InvalidOperationException($"An error occurred while fetching details for Order {orderId}.", ex);
            }
        }


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


        public async Task AddAsync(OrderDto dto, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Adding new Order");

                var order = _mapper.Map<Order>(dto);
                await _unitOfWork.Orders.AddAsync(order, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order added successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while adding Order");
                throw new InvalidOperationException("An error occurred while adding an order.", ex);
            }

        }


        public async Task UpdateAsync(int id, OrderDto dto, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Updating Order {OrderId}", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found for update", id);
                    return;
                }

                _mapper.Map(dto, order);
                await _unitOfWork.Orders.UpdateAsync(order, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} updated successfully", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating Order {OrderId}", id);
                throw new InvalidOperationException($"Failed to update order {id}", ex);
            }

        }


        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Deleting Order {OrderId}", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found for deletion", id);
                    return;
                }

                await _unitOfWork.Orders.DeleteAsync(order, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} deleted successfully", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while deleting Order {OrderId}", id);
                throw new InvalidOperationException($"An error occurred while deleting Order {id}.", ex);
            }

        }

        public async Task<IEnumerable<OrderDto>> GetPharmacyOrdersAsync(int pharmacyId,CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching orders for Pharmacy {PharmacyId}",pharmacyId);

                var orders = await _unitOfWork.Orders.GetOrdersByPharmacyIdAsync(pharmacyId, cancellationToken);

                return _mapper.Map<IEnumerable<OrderDto>>(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,"Failed to fetch orders for Pharmacy {PharmacyId}",pharmacyId);
                throw new InvalidOperationException($"An error occurred while fetching orders for Pharmacy {pharmacyId}.",ex);
            }
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
