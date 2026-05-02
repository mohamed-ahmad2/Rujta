using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs.OrderDto;
using Rujta.Application.Interfaces.InterfaceServices;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService
    {
        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto createOrderDto,Guid userId,CancellationToken cancellationToken = default)
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

                var address = await _unitOfWork.Address.GetByIdAsync(
                    createOrderDto.DeliveryAddressId.Value, cancellationToken)
                    ?? throw new InvalidOperationException("The delivery address does not exist.");

                var deliveryAddressText = BuildAddressText(address);

                var order = new Order
                {
                    UserId = userId,
                    PharmacyId = createOrderDto.PharmacyID,
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,
                    DeliveryAddress = deliveryAddressText,
                    OrderItems = new List<OrderItem>()
                };

                order.TotalPrice = await BuildOrderItemsAsync(order, createOrderDto, cancellationToken);

                await using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);

                await _unitOfWork.Orders.AddAsync(order, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} created successfully for UserId {UserId}",
                    order.Id.ToString(), userId.ToString());

                var orderDto = _mapper.Map<OrderDto>(order);
                orderDto.UserName = appUser.Name;
                orderDto.PharmacyName = pharmacy.Name;

                await _notificationService.NotifyNewOrderAsync(createOrderDto.PharmacyID, orderDto.Id);
                await _notificationService.NotifyOrderItemChangedAsync(order.Id);
                await NotifyService.SendNotificationAsync(
                    userId.ToString(),
                    "Order Created",
                    $"Your order #{order.Id} has been created successfully.",
                    order.Id.ToString());
                await NotifyService.SendNotificationToPharmacyAsync(
                    createOrderDto.PharmacyID.ToString(),
                    $"New order #{order.Id} received!",
                    $"A new order is waiting for your approval.",
    order.Id.ToString());

                return orderDto;
            }
            catch (Exception ex)
            {
                var message = $"Failed to create order for UserId {userId}";
                _logger.LogError(ex, message);
                throw new InvalidOperationException(message, ex);
            }
        }

        private static string BuildAddressText(Address address)
        {
            string street = address.Street ?? "";
            string buildingNo = address.BuildingNo ?? "";
            string city = address.City ?? "";
            string governorate = address.Governorate ?? "";

            var text = $"{street} {buildingNo}".Trim();

            if (!string.IsNullOrEmpty(city) || !string.IsNullOrEmpty(governorate))
                text += $"\n{city} {governorate}".Trim();

            return text;
        }

        private async Task<decimal> BuildOrderItemsAsync( Order order,CreateOrderDto createOrderDto,CancellationToken cancellationToken)
        {
            var medicineIds = createOrderDto.OrderItems
                .Select(i => i.MedicineID)
                .ToList();

            var inventoryItems = await _unitOfWork.InventoryItems
                .FindAsync(
                    i => medicineIds.Contains(i.MedicineID)
                      && i.PharmacyID == createOrderDto.PharmacyID,
                    cancellationToken,
                    include: q => q.Include(i => i.Medicine));

            var inventoryDict = inventoryItems.ToDictionary(i => i.MedicineID);

            decimal totalPrice = 0;

            foreach (var itemDto in createOrderDto.OrderItems)
            {
                if (!inventoryDict.TryGetValue(itemDto.MedicineID, out var inventoryItem))
                    throw new InvalidOperationException(
                        $"Medicine with ID {itemDto.MedicineID} not found in pharmacy inventory.");

                if (inventoryItem.Quantity < itemDto.Quantity)
                    throw new InvalidOperationException(
                        $"Insufficient stock for Medicine ID {itemDto.MedicineID}. " +
                        $"Available: {inventoryItem.Quantity}, Requested: {itemDto.Quantity}");

                // ✅ طبّق الـ Discount
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
    }
}