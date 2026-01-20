using Microsoft.AspNetCore.SignalR;
using Rujta.Domain.Hubs;


namespace Rujta.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repo;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(INotificationRepository repo, IHubContext<NotificationHub> hubContext)
        {
            _repo = repo;
            _hubContext = hubContext;
        }

        public async Task SendNotificationAsync(string userId, string title, string message, string? payload = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Payload = payload,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _repo.AddNotificationAsync(notification);

            // Push to SignalR clients
            await _hubContext.Clients.User(userId)
                .SendAsync("ReceiveNotification", title, message, payload);
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId)
        {
            var notifications = await _repo.GetUserNotificationsAsync(userId);

            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                Payload = n.Payload
            });
        }

        public async Task MarkAsReadAsync(int notificationId)
        {
            await _repo.MarkAsReadAsync(notificationId);
        }
    }
}
