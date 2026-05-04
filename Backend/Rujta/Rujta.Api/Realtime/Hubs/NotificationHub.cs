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
                Console.WriteLine($">>> CLAIM: {claim.Type} = {claim.Value}");

            // ✅ Don't abort — try multiple claim types
            var userId = Context.User?.FindFirst("domainPersonId")?.Value
                      ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? Context.User?.FindFirst("sub")?.Value;

            Console.WriteLine($">>> HUB userId = '{userId}'");

            if (string.IsNullOrEmpty(userId))
            {
                await Clients.Caller.SendAsync("Error", "User context missing.");
                Context.Abort();
                return;
            }

            // Personal group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User-{userId}");

            // Pharmacy group
            var pharmacyId = Context.User?.FindFirst("PharmacyId")?.Value;
            if (!string.IsNullOrEmpty(pharmacyId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"Pharmacy-{pharmacyId}");
                Console.WriteLine($">>> HUB: joined Pharmacy-{pharmacyId}");
            }

            // SuperAdmins group
            if (Context.User?.IsInRole("SuperAdmin") == true)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "SuperAdmins");
                Console.WriteLine($">>> HUB: {userId} joined SuperAdmins group");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst("domainPersonId")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User-{userId}");
                Console.WriteLine($"🔹 User {userId} disconnected.");
            }

            var pharmacyId = Context.User?.FindFirst("PharmacyId")?.Value;
            if (!string.IsNullOrEmpty(pharmacyId))
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Pharmacy-{pharmacyId}");

            // ✅ Leave SuperAdmins group on disconnect
            if (Context.User?.IsInRole("SuperAdmin") == true)
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "SuperAdmins");

            await base.OnDisconnectedAsync(exception);
        }
    }
}