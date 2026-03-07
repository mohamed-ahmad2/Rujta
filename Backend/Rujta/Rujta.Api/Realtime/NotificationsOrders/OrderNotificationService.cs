// OrderNotificationService.cs
using Microsoft.AspNetCore.SignalR;
using Rujta.Domain.Hubs;
using Rujta.Domain.Enums;


namespace Rujta.Infrastructure.Services
{
    public class OrderNotificationService : IOrderNotificationService
    {
        private readonly IHubContext<NotificationHub> _hub;

        public OrderNotificationService(IHubContext<NotificationHub> hub)
        {
            _hub = hub;
        }

        public async Task NotifyStatusChangedAsync(Guid userId, int orderId, OrderStatus orderStatus)
        {
            // إرسال Notification مباشرة للمستخدم بناءً على الـ Guid
            await _hub.Clients.Group(userId.ToString())
                .SendAsync("OrderStatusChanged", orderId, orderStatus);
        }
    }
}