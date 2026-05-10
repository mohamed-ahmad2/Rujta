using Microsoft.EntityFrameworkCore;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService
    {
        public async Task<(bool success, string message)> MarkAsDeliveredAsync(
            int id,
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Marking Order {OrderId} as Delivered", id);

            Order? deliveredOrder = null;

            try
            {
                var result = await _unitOfWork.ExecuteInTransactionAsync<(bool success, string message)>(
                    async ct => await ProcessDeliveryAsync(id, pharmacyId, ct, o => deliveredOrder = o),
                    cancellationToken);

                if (!result.success || deliveredOrder == null)
                    return result;

                await HandlePostDeliveryAsync(deliveredOrder);

                return result;
            }
            catch (DbUpdateConcurrencyException)
            {
                _logger.LogWarning("Concurrency conflict when delivering Order {OrderId}", id);
                return (false, "Order was modified by another user. Please refresh and try again.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error delivering Order {OrderId}", id);
                return (false, "An unexpected error occurred");
            }
        }

        // ─────────────────────────────────────────────────────────────────────────
        // Core delivery processing
        // ─────────────────────────────────────────────────────────────────────────
        private async Task<(bool success, string message)> ProcessDeliveryAsync(
            int orderId,
            int pharmacyId,
            CancellationToken ct,
            Action<Order> setDeliveredOrder)
        {
            var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(orderId, ct);

            var validationResult = ValidateOrderForDelivery(order, pharmacyId);
            if (!validationResult.success)
                return validationResult;

            // ── الكاش: PaymentStatus يتحول لـ Success عند الاستلام الفعلي
            // ── Payment (Paymob): كان بالفعل Success من بعد الـ callback
            HandlePaymentOnDelivery(order!);

            var stockResult = await DeductInventoryAsync(order!, ct);
            if (!stockResult.success)
                return stockResult;

            order!.Status = OrderStatus.Delivered;
            await _unitOfWork.SaveAsync(ct);

            setDeliveredOrder(order);

            return (true, OrderMessages.OrderMarkAsDelivered);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // Validation
        // ─────────────────────────────────────────────────────────────────────────
        private static (bool success, string message) ValidateOrderForDelivery(
            Order? order, int pharmacyId)
        {
            if (order == null)
                return (false, OrderMessages.OrderNotFound);

            if (order.PharmacyId != pharmacyId)
                return (false, "Unauthorized pharmacy access");

            if (!CanChangeStatus(order.Status, OrderStatus.Delivered))
                return (false, OrderMessages.InvalidStateTransition);

            // أوردرات الـ Payment لازم تكون مدفوعة قبل التسليم
            if (order.PaymentMethod == PaymentMethod.Payment &&
                order.PaymentStatus != PaymentStatus.Success)
            {
                return (false, "Cannot deliver order: online payment has not been confirmed.");
            }

            return (true, string.Empty);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // Payment handling on delivery
        // الكاش: يُسجّل الدفع عند الاستلام
        // Paymob: مدفوع مسبقاً — لا نعدّل شيئاً
        // ─────────────────────────────────────────────────────────────────────────
        private void HandlePaymentOnDelivery(Order order)
        {
            if (order.PaymentMethod == PaymentMethod.Cash)
            {
                _logger.LogInformation(
                    "Order {OrderId} paid in cash on delivery — marking PaymentStatus as Success",
                    order.Id);
                order.PaymentStatus = PaymentStatus.Success;
            }
            else if (order.PaymentMethod == PaymentMethod.Payment)
            {
                // Paymob callback سبق وغيّر الـ PaymentStatus لـ Success
                // لا نعدّل شيئاً هنا
                _logger.LogInformation(
                    "Order {OrderId} was pre-paid via Paymob — PaymentStatus already Success",
                    order.Id);
            }
        }

        // ─────────────────────────────────────────────────────────────────────────
        // Post-delivery notifications
        // ─────────────────────────────────────────────────────────────────────────
        private async Task HandlePostDeliveryAsync(Order order)
        {
            await SafeNotifyDeliveredAsync(order);

            if (order.UserId == null)
            {
                _logger.LogError("UserId is null for delivered Order {OrderId}", order.Id);
                return;
            }

            await NotifyService.SendNotificationAsync(
                order.UserId.Value.ToString(),
                "Order Delivered",
                $"Your order #{order.Id} has been successfully delivered. Thank you for choosing us.",
                order.Id.ToString());
        }

        // ─────────────────────────────────────────────────────────────────────────
        // Inventory deduction
        // ─────────────────────────────────────────────────────────────────────────
        private async Task<(bool success, string message)> DeductInventoryAsync(
            Order order,
            CancellationToken cancellationToken)
        {
            foreach (var item in order.OrderItems)
            {
                var inventoryItem = await _unitOfWork.InventoryItems
                    .GetByMedicineAndPharmacyAsync(item.MedicineID, order.PharmacyId, cancellationToken);

                if (inventoryItem == null)
                    return (false, "Inventory item not found");

                if (inventoryItem.Quantity < item.Quantity)
                    return (false, "Insufficient stock to deliver order");

                inventoryItem.Quantity -= item.Quantity;

                if (inventoryItem.Quantity == 0)
                    inventoryItem.Status = ProductStatus.OutOfStock;

                await _unitOfWork.InventoryItems.UpdateAsync(inventoryItem);
            }

            return (true, string.Empty);
        }
    }
}