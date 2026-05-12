using Rujta.Application.DTOs.OrderDto;
using Rujta.Domain.Common;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService
    {
        public async Task<OrderDto> CreateOrderAsync(
            CreateOrderDto createOrderDto,
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Creating new order for UserId {UserId}", userId);

                bool isCustomerOrder = userId == Guid.Empty;

                Person? appPerson = null;

                if (!isCustomerOrder)
                {
                    appPerson = await _unitOfWork.People.GetByGuidAsync(userId, cancellationToken)
                        ?? throw new InvalidOperationException($"User with ID {userId} not found.");
                }
                else if (createOrderDto.CustomerId.HasValue)
                {
                    appPerson = await _unitOfWork.People.GetByGuidAsync(
                        createOrderDto.CustomerId.Value,
                        cancellationToken);
                }

                var pharmacy = await _unitOfWork.Pharmacies.GetByIdWithAddressAsync(
                    createOrderDto.PharmacyID,
                    cancellationToken)
                    ?? throw new InvalidOperationException($"Pharmacy with ID {createOrderDto.PharmacyID} not found.");

                if (pharmacy.Address == null)
                    throw new InvalidOperationException("Pharmacy address is null.");

                string deliveryAddressText;

                if (!createOrderDto.IsInStore)
                {
                    if (!createOrderDto.DeliveryAddressId.HasValue)
                        throw new InvalidOperationException("Delivery address ID is required.");

                    var address = await _unitOfWork.Address.GetByIdAsync(
                        createOrderDto.DeliveryAddressId.Value,
                        cancellationToken)
                        ?? throw new InvalidOperationException("Delivery address not found.");

                    deliveryAddressText = BuildAddressText(address);
                }
                else
                {
                    deliveryAddressText = BuildAddressText(pharmacy.Address);
                }

                var order = new Order
                {
                    UserId = isCustomerOrder ? null : userId,
                    CustomerId = createOrderDto.CustomerId,
                    PharmacyId = createOrderDto.PharmacyID,
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,
                    DeliveryAddress = deliveryAddressText,
                    OrderItems = new List<OrderItem>()
                };

                order.TotalPrice = await BuildOrderItemsAsync(order, createOrderDto, cancellationToken);

                var savedOrder = await _unitOfWork.ExecuteInTransactionAsync(async ct =>
                {
                    await _unitOfWork.Orders.AddAsync(order, ct);
                    await _unitOfWork.SaveAsync(ct);
                    return order;
                }, cancellationToken);

                var orderDto = _mapper.Map<OrderDto>(savedOrder);
                orderDto.UserName = appPerson?.Name ?? "";
                orderDto.PharmacyName = pharmacy.Name;

                await _notificationService.NotifyNewOrderAsync(createOrderDto.PharmacyID, orderDto.Id);
                await _notificationService.NotifyOrderItemChangedAsync(savedOrder.Id);

                if (!isCustomerOrder)
                {
                    await NotifyService.SendNotificationAsync(
                        userId.ToString(),
                        "Order Created",
                        $"Your order #{savedOrder.Id} has been created successfully.",
                        savedOrder.Id.ToString());
                }

                await NotifyService.SendNotificationToPharmacyAsync(
                    createOrderDto.PharmacyID.ToString(),
                    $"New order #{savedOrder.Id} received!",
                    "A new order is waiting for your approval.",
                    savedOrder.Id.ToString());

                return orderDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create order for UserId {UserId}", userId);
                throw new InvalidOperationException("Order creation failed.", ex);
            }
        }

        private async Task<decimal> BuildOrderItemsAsync(
            Order order,
            CreateOrderDto createOrderDto,
            CancellationToken cancellationToken)
        {
            var medicineIds = createOrderDto.OrderItems
                .Select(i => i.MedicineID)
                .Distinct()
                .ToList();

            var inventoryDict = await _unitOfWork.InventoryItems
                .GetBestInventoryItemsAsync(
                    createOrderDto.PharmacyID,
                    medicineIds,
                    cancellationToken);

            decimal totalPrice = 0;

            foreach (var itemDto in createOrderDto.OrderItems)
            {
                if (!inventoryDict.TryGetValue(itemDto.MedicineID, out var inventoryItem))
                    throw new InvalidOperationException(
                        $"Medicine {itemDto.MedicineID} not found in pharmacy inventory.");

                if (inventoryItem.Quantity < itemDto.Quantity)
                    throw new InvalidOperationException(
                        $"Insufficient stock for Medicine {itemDto.MedicineID}. " +
                        $"Available: {inventoryItem.Quantity}, Requested: {itemDto.Quantity}");

                var pricePerUnit = await _discountService.ApplyDiscountAsync(inventoryItem);

                var orderItem = new OrderItem
                {
                    MedicineID = inventoryItem.MedicineID,
                    Quantity = itemDto.Quantity,
                    PricePerUnit = pricePerUnit,
                    SubTotal = itemDto.Quantity * pricePerUnit
                };

                order.OrderItems.Add(orderItem);
                totalPrice += orderItem.SubTotal;
            }

            return totalPrice;
        }

        private static string BuildAddressText(Address address)
        {
            var street = address.Street ?? "";
            var buildingNo = address.BuildingNo ?? "";
            var city = address.City ?? "";
            var governorate = address.Governorate ?? "";

            var text = $"{street} {buildingNo}".Trim();

            if (!string.IsNullOrWhiteSpace(city) || !string.IsNullOrWhiteSpace(governorate))
                text += $"\n{city} {governorate}".Trim();

            return text;
        }
    }
}