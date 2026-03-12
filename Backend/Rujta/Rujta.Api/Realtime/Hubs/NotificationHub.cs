using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Rujta.Application.Notifications;
using System.Security.Claims;

namespace Rujta.API.Realtime.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly INotificationPublisher _publisher;

        public NotificationHub(INotificationPublisher publisher)
        {
            _publisher = publisher;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("domainPersonId")?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("Error", "User context missing.");
                Context.Abort();
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"User-{userId}");

            Console.WriteLine($"🔹 NotificationHub: User {userId} connected with connectionId {Context.ConnectionId}");

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst("domainPersonId")?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User-{userId}");
                Console.WriteLine($"🔹 NotificationHub: User {userId} disconnected.");
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}