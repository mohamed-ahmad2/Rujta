using Microsoft.AspNetCore.SignalR;

namespace Rujta.Domain.Hubs
{
    public class NotificationHub : Hub
    {
        private static readonly Dictionary<string, string> OnlineUsers = new();

        public override Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();
            if (!string.IsNullOrEmpty(userId))
            {
                OnlineUsers[userId] = Context.ConnectionId;
            }

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            var user = OnlineUsers.FirstOrDefault(x => x.Value == Context.ConnectionId);
            if (!string.IsNullOrEmpty(user.Key))
            {
                OnlineUsers.Remove(user.Key);
            }

            return base.OnDisconnectedAsync(exception);
        }

        public async Task SendNotificationToUser(string userId, string title, string message)
        {
            if (OnlineUsers.TryGetValue(userId, out var connId))
            {
                await Clients.Client(connId).SendAsync("ReceiveNotification", title, message);
            }
        }
    }
}

