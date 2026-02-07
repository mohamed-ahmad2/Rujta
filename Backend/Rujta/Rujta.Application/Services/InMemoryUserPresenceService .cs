// InMemoryUserPresenceService.cs (Modified: Added IHubContext, removed event, updated ForceLogoutAsync)
using Microsoft.AspNetCore.SignalR;
using Rujta.Application.Hubs;
using Rujta.Domain.Interfaces;
using System.Collections.Concurrent;

namespace Rujta.Application.Services
{
    public class InMemoryUserPresenceService : IUserPresenceService
    {
        private readonly ConcurrentDictionary<string, (string UserId, string PharmacyId)> _connections = new();
        private readonly ConcurrentDictionary<string, List<string>> _userConnections = new();
        private readonly IHubContext<PresenceHub> _hubContext;

        public InMemoryUserPresenceService(IHubContext<PresenceHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public void UserConnected(string userId, string pharmacyId, string connectionId)
        {
            _connections[connectionId] = (userId, pharmacyId);

            _userConnections.AddOrUpdate(
                userId,
                new List<string> { connectionId },
                (key, list) =>
                {
                    list.Add(connectionId);
                    return list;
                });
        }

        public void UserDisconnected(string connectionId)
        {
            if (_connections.TryRemove(connectionId, out var value))
            {
                if (_userConnections.TryGetValue(value.UserId, out var list))
                {
                    list.Remove(connectionId);
                    if (list.Count == 0)
                        _userConnections.TryRemove(value.UserId, out _);
                }
            }
        }

        public IEnumerable<string> GetOnlinePharmacists(string pharmacyId)
        {
            return _connections.Values
                .Where(x => x.PharmacyId == pharmacyId)
                .Select(x => x.UserId)
                .Distinct();
        }

        public IEnumerable<string> GetConnectionIds(string userId)
        {
            return _userConnections.TryGetValue(userId, out var list) ? list : Enumerable.Empty<string>();
        }

        public async Task ForceLogoutAsync(string userId)
        {
            var connectionIds = GetConnectionIds(userId).ToList();

            foreach (var connId in connectionIds)
            {
                await _hubContext.Clients.Client(connId).SendAsync("ForceLogout");
                UserDisconnected(connId);
            }
        }
    }
}