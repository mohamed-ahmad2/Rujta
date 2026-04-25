using Microsoft.EntityFrameworkCore;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService
    {
        public Task<(bool success, string message)> AcceptOrderAsync(
            int id, int pharmacyId, CancellationToken cancellationToken = default) =>
            SafeUpdateOrderAsync(id, pharmacyId, OrderStatus.Accepted, cancellationToken);

        public Task<(bool success, string message)> CancelOrderByUserAsync(
            int id, CancellationToken cancellationToken = default) =>
            SafeUpdateOrderAsync(id, 0, OrderStatus.CancelledByUser, cancellationToken, isUser: true);

        public Task<(bool success, string message)> CancelOrderByPharmacyAsync(
            int id, int pharmacyId, CancellationToken cancellationToken = default) =>
            SafeUpdateOrderAsync(id, pharmacyId, OrderStatus.CancelledByPharmacy, cancellationToken);

        public Task<(bool success, string message)> ProcessOrderAsync(
            int id, int pharmacyId, CancellationToken cancellationToken = default) =>
            SafeUpdateOrderAsync(id, pharmacyId, OrderStatus.Processing, cancellationToken);

        public Task<(bool success, string message)> OutForDeliveryAsync(
            int id, int pharmacyId, CancellationToken cancellationToken = default) =>
            SafeUpdateOrderAsync(id, pharmacyId, OrderStatus.OutForDelivery, cancellationToken);


        private async Task<(bool success, string message)> SafeUpdateOrderAsync(
            int id,
            int pharmacyId,
            OrderStatus newStatus,
            CancellationToken cancellationToken = default,
            int maxRetries = 3,
            bool isUser = false)
        {
            int retryCount = 0;

            while (retryCount < maxRetries)                                         
            {
                try
                {
                    var (handled, success, message) = await TryUpdateOrderOnceAsync(
                        id, pharmacyId, newStatus, isUser, cancellationToken);

                    if (handled) return (success, message);                         
                }
                catch (DbUpdateConcurrencyException)                              
                {
                    var (shouldStop, result) = await HandleConcurrencyExceptionAsync(
                        id, retryCount, maxRetries, cancellationToken);

                    if (shouldStop) return result;                                  

                    retryCount++;
                }
                catch (Exception ex)                                                
                {
                    _logger.LogError(ex, "Error updating order {OrderId}", id);
                    return (false, "An unexpected error occurred");
                }
            }
            return (false, "Maximum retries exceeded due to concurrency conflicts.");
        }

        private async Task<(bool handled, bool success, string message)> TryUpdateOrderOnceAsync(
            int id,
            int pharmacyId,
            OrderStatus newStatus,
            bool isUser,
            CancellationToken cancellationToken)
        {
            var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);

            if (order == null)                                                       
                return (true, false, OrderMessages.OrderNotFound);

            if (!isUser && order.PharmacyId != pharmacyId)                          
                return (true, false, "Unauthorized pharmacy access");

            if (!CanChangeStatus(order.Status, newStatus))                        
                return (true, false, OrderMessages.InvalidStateTransition);

            if (order.Status == newStatus)                                            
                return (true, true, "Already updated");

            order.Status = newStatus;
            await _unitOfWork.SaveAsync(cancellationToken);

            await SafeNotifyAsync(order, newStatus);
            await SendOrderStatusNotification(order);

            return (true, true, GetSuccessMessage(newStatus));
        }

        private static bool CanChangeStatus(OrderStatus current, OrderStatus next) =>
            (current, next) switch
            {
                (OrderStatus.Pending, OrderStatus.Accepted) => true,
                (OrderStatus.Accepted, OrderStatus.Processing) => true,
                (OrderStatus.Processing, OrderStatus.OutForDelivery) => true,
                (OrderStatus.OutForDelivery, OrderStatus.Delivered) => true,
                (OrderStatus.Pending or OrderStatus.Accepted, OrderStatus.CancelledByUser) => true,
                (OrderStatus.Pending or OrderStatus.Accepted, OrderStatus.CancelledByPharmacy) => true,
                _ => false
            };

        private static string GetSuccessMessage(OrderStatus status) =>
            status switch
            {
                OrderStatus.Accepted => OrderMessages.OrderAccepted,
                OrderStatus.CancelledByUser => OrderMessages.OrderCancelByUser,
                OrderStatus.CancelledByPharmacy => OrderMessages.OrderCancelByPharmacy,
                OrderStatus.Processing => OrderMessages.OrderProcessNow,
                OrderStatus.OutForDelivery => OrderMessages.OrderOutForDelivery,
                OrderStatus.Delivered => OrderMessages.OrderMarkAsDelivered,
                _ => "Status updated successfully"
            };

        private async Task<(bool shouldStop, (bool success, string message) result)>
            HandleConcurrencyExceptionAsync(
                int orderId,
                int retryCount,
                int maxRetries,
                CancellationToken cancellationToken)
        {
            _logger.LogWarning(
                "Concurrency conflict when updating Order {OrderId}. Retry {RetryCount}",
                orderId, retryCount + 1);

            if (retryCount + 1 >= maxRetries)
                return (true, (false,
                    "Order was modified by another user. Please refresh and try again after multiple attempts."));

            await Task.Delay(100 * (retryCount + 1), cancellationToken);
            return (false, default);
        }
    }
}