using Microsoft.Extensions.DependencyInjection;
using Rujta.Application.Notifications;

namespace Rujta.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly INotificationPublisher _publisher;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IServiceScopeFactory scopeFactory,
            INotificationPublisher publisher,
            ILogger<NotificationService> logger)
        {
            _scopeFactory = scopeFactory;
            _publisher = publisher;
            _logger = logger;
        }

        public Task SendNotificationAsync(
            string userId,
            string title,
            string message,
            string? payload = null)
            => SendInternalAsync(userId, title, message, payload, isPharmacy: false);

        public Task SendNotificationToPharmacyAsync(
            string pharmacyId,
            string title,
            string message,
            string? payload = null)
            => SendInternalAsync(pharmacyId, title, message, payload, isPharmacy: true);

        private async Task SendInternalAsync(
            string targetId,
            string title,
            string message,
            string? payload,
            bool isPharmacy)
        {
            if (string.IsNullOrWhiteSpace(targetId))
            {
                _logger.LogWarning("Attempted to send notification with empty target id");
                return;
            }

            try
            {
                // 1. Save to DB
                using var scope = _scopeFactory.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

                var notification = new Notification
                {
                    UserId = targetId,
                    Title = title,
                    Message = message,
                    Payload = payload,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                await repo.AddNotificationAsync(notification);

                var dto = new NotificationDto
                {
                    Id = notification.Id,
                    Title = title,
                    Message = message,
                    Payload = payload,
                    CreatedAt = notification.CreatedAt,
                    IsRead = false
                };

                // 2. Publish via SignalR immediately — no queue
                if (isPharmacy)
                {
                    Console.WriteLine($">>> SENDING to Pharmacy-{targetId}: {title}");
                    await _publisher.PublishToPharmacyAsync(targetId, dto);
                    Console.WriteLine($"📣 Sent notification to Pharmacy-{targetId}: {title}");
                }
                else
                {
                    Console.WriteLine($">>> SENDING to User-{targetId}: {title}");
                    await _publisher.PublishAsync(targetId, dto);
                    Console.WriteLine($"📣 Sent notification to User-{targetId}: {title}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to send notification to {TargetId}: {Title}",
                    targetId, title);
            }
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            var notifications = await repo.GetUserNotificationsAsync(userId);
            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Payload = n.Payload,
                CreatedAt = n.CreatedAt,
                IsRead = n.IsRead
            });
        }

        public async Task MarkAsReadAsync(int notificationId, string userId)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            await repo.MarkAsReadAsync(notificationId, userId);
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            return await repo.GetUnreadCountAsync(userId);
        }
    }
}