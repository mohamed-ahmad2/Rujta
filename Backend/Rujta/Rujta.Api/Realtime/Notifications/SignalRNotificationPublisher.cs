using Microsoft.AspNetCore.SignalR;
using Rujta.Application.Notifications;

namespace Rujta.API.Realtime.Services
{
    public class SignalRNotificationPublisher : INotificationPublisher
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public SignalRNotificationPublisher(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task PublishAsync(string userId, NotificationDto dto)
        {
            // إرسال للإشعار للمجموعة الخاصة بالمستخدم
            await _hubContext.Clients.Group($"User-{userId}").SendAsync("NewNotification", dto);
            Console.WriteLine($"📣 Sent notification to User-{userId}: {dto.Title}");
        }
    }
}