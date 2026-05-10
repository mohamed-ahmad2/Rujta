using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs.OrderDto;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService
    {
        // ─────────────────────────────────────────────────────────────────────────
        // PUBLIC: Cash flow — يُنشئ الـ order مباشرةً بدون دفع مسبق
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<OrderDto> CreateOrderAsync(
            CreateOrderDto createOrderDto,
            Guid userId,
            CancellationToken cancellationToken = default)
        {
            if (createOrderDto.PaymentMethod == PaymentMethod.Payment)
                throw new InvalidOperationException(
                    "Online payment orders must be created via CreateOrderAfterPaymentAsync " +
                    "after a successful Paymob transaction.");

            return await CreateOrderInternalAsync(createOrderDto, userId, cancellationToken);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // INTERNAL: يُستدعى من PaymentService بعد نجاح الـ callback من Paymob
        // PaymentStatus يكون Success مباشرةً لأن الدفع تم فعلاً
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<OrderDto> CreateOrderAfterPaymentAsync(
            CreateOrderDto createOrderDto,
            Guid userId,
            int internalPaymentId,
            CancellationToken cancellationToken = default)
        {
            if (createOrderDto.PaymentMethod != PaymentMethod.Payment)
                throw new InvalidOperationException(
                    "This method is only for online payment orders.");

            // نتأكد إن الـ payment موجود وناجح فعلاً
            var payment = await _unitOfWork.Payments.GetByIdAsync(internalPaymentId, cancellationToken)
                ?? throw new InvalidOperationException(
                    $"Payment record {internalPaymentId} not found.");

            if (payment.Status != PaymentStatus.Success)
                throw new InvalidOperationException(
                    "Cannot create order: payment has not been confirmed as successful.");

            var order = await CreateOrderInternalAsync(
                createOrderDto, userId, cancellationToken,
                overridePaymentStatus: PaymentStatus.Success);

            // نربط الـ payment بالـ order الجديد
            payment.OrderId = order.Id;
            await _unitOfWork.Payments.UpdateAsync(payment, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            return order;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // CORE: البناء الفعلي للـ order — مشترك بين الـ Cash والـ Payment
        // ─────────────────────────────────────────────────────────────────────────
        private async Task<OrderDto> CreateOrderInternalAsync(
            CreateOrderDto createOrderDto,
            Guid userId,
            CancellationToken cancellationToken,
            PaymentStatus overridePaymentStatus = PaymentStatus.Pending)
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
                    PaymentMethod = createOrderDto.PaymentMethod,
                    PaymentStatus = overridePaymentStatus,   // Pending للكاش، Success للـ Payment
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

                _logger.LogInformation(
                    "Order {OrderId} created successfully for UserId {UserId} | PaymentMethod: {Method} | PaymentStatus: {Status}",
                    savedOrder.Id, userId, createOrderDto.PaymentMethod, overridePaymentStatus);

                var orderDto = _mapper.Map<OrderDto>(savedOrder);
                orderDto.UserName = appUser.Name;
                orderDto.PharmacyName = pharmacy.Name;

                await _notificationService.NotifyNewOrderAsync(createOrderDto.PharmacyID, orderDto.Id);
                await _notificationService.NotifyOrderItemChangedAsync(savedOrder.Id);

                await NotifyService.SendNotificationAsync(
                    userId.ToString(),
                    "Order Created",
                    $"Your order #{savedOrder.Id} has been created successfully.",
                    savedOrder.Id.ToString());

                await NotifyService.SendNotificationToPharmacyAsync(
                    createOrderDto.PharmacyID.ToString(),
                    $"New order #{savedOrder.Id} received!",
                    "A new order is waiting for your approval.",
                    savedOrder.Id.ToString());

                return orderDto;
            }
            catch (InvalidOperationException)
            {
                throw;
            }
            catch (Exception ex)
            {
                var message = $"Failed to create order for UserId {userId}";
                _logger.LogError(ex, message);
                throw new InvalidOperationException(message, ex);
            }
        }

        // ─────────────────────────────────────────────────────────────────────────
        // Helpers
        // ─────────────────────────────────────────────────────────────────────────
        private static string BuildAddressText(Address address)
        {
            var street = address.Street ?? "";
            var buildingNo = address.BuildingNo ?? "";
            var city = address.City ?? "";
            var governorate = address.Governorate ?? "";

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