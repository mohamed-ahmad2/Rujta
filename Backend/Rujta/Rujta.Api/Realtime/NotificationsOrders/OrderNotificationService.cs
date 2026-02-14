using Microsoft.AspNetCore.SignalR;
using OsmSharp.API;
using Rujta.API.Realtime.Hubs;
using Rujta.Domain.Enums;

namespace Rujta.API.Realtime.NotificationsOrders
{
    public class OrderNotificationService(IHubContext<OrderHub> _hub) : IOrderNotificationService
    {
        public async Task NotifyStatusChangedAsync(int pharmacyId, int orderId, OrderStatus orderStatus)
        {
            await _hub.Clients.Group($"Pharmacy-{pharmacyId}").SendAsync("OrderStatusChanged", orderId, orderStatus);
        }
    }
}
