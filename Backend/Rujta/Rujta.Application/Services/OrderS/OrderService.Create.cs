using Rujta.Application.DTOs.OrderDto;
using Rujta.Domain.Entities;

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

                return orderDto;
            }
            catch (Exception ex)
            {
                var message = $"Failed to create order for UserId {userId}";
                _logger.LogError(ex, message);
                throw new InvalidOperationException(message, ex);
            }
        }

        // ── Private Helpers ────────────────────────────────────────────────
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

        private async Task<decimal> BuildOrderItemsAsync(
            Order order,
            CreateOrderDto createOrderDto,
            CancellationToken cancellationToken)
        {
            var medicineIds = createOrderDto.OrderItems.Select(i => i.MedicineID).ToList();
            var medicines = await _unitOfWork.InventoryItems
                .FindAsync(m => medicineIds.Contains(m.Id), cancellationToken);
            var medicineDict = medicines.ToDictionary(m => m.Id);

            decimal totalPrice = 0;

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

            return totalPrice;
        }
    }
}