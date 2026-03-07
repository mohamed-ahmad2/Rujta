// OrderNotificationService.cs
using Microsoft.AspNetCore.SignalR;
using Rujta.Domain.Hubs;
using Rujta.Domain.Enums;


namespace Rujta.Infrastructure.Services
{
    public class OrderNotificationService
        : IOrderNotificationService
    {
        private readonly IHubContext<OrderHub> _hub;

        public OrderNotificationService(
            IHubContext<OrderHub> hub)

        {
            _hub = hub;
        }

        // New Order Created
        public async Task NotifyNewOrderAsync(
            int pharmacyId,
            int orderId)
        {
            await _hub.Clients
                .Group($"Pharmacy-{pharmacyId}")
                .SendAsync(
                    "NewOrderReceived",
                    orderId);
        }


        public async Task NotifyOrderUpdatedAsync(
            int pharmacyId,
            int orderId)
        {
            await _hub.Clients
                .Group($"Pharmacy-{pharmacyId}")
                .SendAsync(
                    "OrderUpdated",
                    orderId);
        }

        // Status changed
        public async Task NotifyStatusChangedAsync(
            int pharmacyId,
            string userId,
            int orderId,
            OrderStatus status)
        {
            await Task.WhenAll(

                _hub.Clients
                    .Group($"Pharmacy-{pharmacyId}")
                    .SendAsync(
                        "OrderStatusChanged",
                        orderId,
                        status),

                _hub.Clients
                    .Group($"User-{userId}")
                    .SendAsync(
                        "OrderStatusChanged",
                        orderId,
                        status)
            );
        }

        public async Task NotifyOrderItemChangedAsync(
            int orderId)
        {
            await _hub.Clients
                .Group($"Order-{orderId}")
                .SendAsync(
                    "OrderItemChanged",
                    orderId);

        }
    }
}