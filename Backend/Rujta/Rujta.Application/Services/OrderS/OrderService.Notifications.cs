using Rujta.Domain.Entities;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService
    {
        private async Task SafeNotifyAsync(Order order, OrderStatus status)
        {
            try
            {
                if (order.UserId == null)
                    throw new InvalidOperationException("Order user is missing");

                await _notificationService.NotifyStatusChangedAsync(
                    order.PharmacyId,
                    order.UserId.ToString()!,
                    order.Id,
                    status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Notification failed for Order {OrderId}", order.Id);
            }
        }

        private async Task SafeNotifyDeliveredAsync(Order order)
        {
            try
            {
                if (order.UserId == null)
                    throw new InvalidOperationException("Order user is missing");

                await _notificationService.NotifyStatusChangedAsync(
                    order.PharmacyId,
                    order.UserId.ToString()!,
                    order.Id,
                    OrderStatus.Delivered);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Delivery notification failed for Order {OrderId}", order.Id);
            }
        }

        private async Task SendOrderStatusNotification(Order order)
        {
            if (order.UserId == null) return;

            string title = "Order Update";
            string message = order.Status switch
            {
                OrderStatus.Accepted => $"Your order #{order.Id} has been accepted.",
                OrderStatus.Processing => $"Your order #{order.Id} is being prepared.",
                OrderStatus.OutForDelivery => $"Your order #{order.Id} is out for delivery.",
                OrderStatus.Delivered => $"Your order #{order.Id} has been delivered.",
                OrderStatus.CancelledByUser => $"Your order #{order.Id} was cancelled.",
                OrderStatus.CancelledByPharmacy => $"Your order #{order.Id} was cancelled by the pharmacy.",
                _ => $"Your order #{order.Id} status updated."
            };

            await NotifyService.SendNotificationAsync(
                order.UserId.ToString()!,
                title,
                message,
                order.Id.ToString());
        }
        private async Task SendOrderNotificationToPharmacy(Order order)
        {
            string title = order.Status switch
            {
                OrderStatus.Pending => $"New order #{order.Id} received!",
                OrderStatus.CancelledByUser => $"Order #{order.Id} was cancelled by user.",
                _ => $"Order #{order.Id} status changed."
            };

            string message = order.Status switch
            {
                OrderStatus.Pending => $"A new order has been placed and is waiting for your approval.",
                OrderStatus.CancelledByUser => $"The user cancelled order #{order.Id}. Please update your stock.",
                _ => $"Order status is now {order.Status}."
            };

            // Send to pharmacy admin using pharmacyId as their userId
            await NotifyService.SendNotificationAsync(
                order.PharmacyId.ToString(),  // pharmacy admin's userId
                title,
                message,
                order.Id.ToString()
            );
        }
    }
}