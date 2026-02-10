using Microsoft.AspNetCore.SignalR;
using Rujta.Domain.Interfaces;
using System.Collections.Concurrent;

namespace Rujta.Application.Services
{
    public class InMemoryUserPresenceService : IUserPresenceService
    {
        private readonly ConcurrentDictionary<string, (string UserId, string PharmacyId)> _connections = new();
        private readonly ConcurrentDictionary<string, List<string>> _userConnections = new();
        

        public InMemoryUserPresenceService()
        {

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
            if (_connections.TryRemove(connectionId, out var value) && _userConnections.TryGetValue(value.UserId, out var list))
            {
                    list.Remove(connectionId);
                    if (list.Count == 0)
                        _userConnections.TryRemove(value.UserId, out _);
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
    }
}