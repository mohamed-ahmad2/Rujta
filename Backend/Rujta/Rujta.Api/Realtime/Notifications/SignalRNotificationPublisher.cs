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
            // ADD THIS:
            Console.WriteLine($">>> PUBLISHER: userId = '{userId}'");
            Console.WriteLine($">>> PUBLISHER: sending to group = 'User-{userId}'");

            await _hubContext.Clients.Group($"User-{userId}").SendAsync("NewNotification", dto);
            Console.WriteLine($"📣 Sent notification to User-{userId}: {dto.Title}");
        }
        // ✅ ADD THIS — sends to pharmacy group
        public async Task PublishToPharmacyAsync(string pharmacyId, NotificationDto dto)
        {
            Console.WriteLine($">>> PUBLISHER: sending to pharmacy group = 'Pharmacy-{pharmacyId}'");
            await _hubContext.Clients.Group($"Pharmacy-{pharmacyId}").SendAsync("NewNotification", dto);
            Console.WriteLine($"📣 Sent notification to Pharmacy-{pharmacyId}: {dto.Title}");
        }
    }
}