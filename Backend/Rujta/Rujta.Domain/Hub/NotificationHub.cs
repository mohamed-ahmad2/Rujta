using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Rujta.Domain.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            // خذ الـ userId مباشرة من JWT claim
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                // لو مش موجود الـ claim افصل الاتصال
                await Clients.Caller.SendAsync("Error", "User context missing.");
                Context.Abort();
                return;
            }


            string userId = userIdClaim.Value;

            // أضف الاتصال للجروب الخاص بالـ user
            Console.WriteLine($"Connected: {Context.ConnectionId}");

            await Groups.AddToGroupAsync(Context.ConnectionId, userId);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                string userId = userIdClaim.Value;
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}