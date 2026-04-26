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
            foreach (var claim in Context.User?.Claims ?? Enumerable.Empty<Claim>())
            {
                Console.WriteLine($">>> CLAIM: {claim.Type} = {claim.Value}");
            }

            var userId = Context.User?.FindFirst("domainPersonId")?.Value;
            Console.WriteLine($">>> HUB userId = '{userId}'");
            Console.WriteLine($">>> HUB group  = 'User-{userId}'");

            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("Error", "User context missing.");
                Context.Abort();
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"User-{userId}");

            // ✅ ADD THESE 3 LINES — join pharmacy group if this user is pharmacy admin
            var pharmacyId = Context.User?.FindFirst("PharmacyId")?.Value;
            if (!string.IsNullOrEmpty(pharmacyId))
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Pharmacy-{pharmacyId}");

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

            // ✅ ADD THESE 3 LINES — leave pharmacy group on disconnect
            var pharmacyId = Context.User?.FindFirst("PharmacyId")?.Value;
            if (!string.IsNullOrEmpty(pharmacyId))
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Pharmacy-{pharmacyId}");

            await base.OnDisconnectedAsync(exception);
        }
    }
}