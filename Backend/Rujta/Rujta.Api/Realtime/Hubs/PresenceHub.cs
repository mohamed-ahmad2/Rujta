using Microsoft.AspNetCore.SignalR;
using Rujta.Domain.Interfaces;
using Rujta.Infrastructure.Identity;

namespace Rujta.API.Realtime.Hubs
{
    public class PresenceHub : Hub
    {
        private readonly IUserPresenceService _presenceService;

        public PresenceHub(IUserPresenceService presenceService)
        {
            _presenceService = presenceService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            var pharmacyId = Context.User?.FindFirst("PharmacyId")?.Value;

            if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(pharmacyId))
            {
                if (role == UserRole.Pharmacist.ToString())
                {
                    _presenceService.UserConnected(userId, pharmacyId, Context.ConnectionId);
                    await Clients.Group($"Managers-{pharmacyId}").SendAsync("PharmacistOnline", userId);
                }
                else if (role == UserRole.PharmacyAdmin.ToString())
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"Managers-{pharmacyId}");
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = Context.User?.FindFirst(ClaimTypes.Role)?.Value;
            var pharmacyId = Context.User?.FindFirst("PharmacyId")?.Value;

            if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(pharmacyId))
            {
                _presenceService.UserDisconnected(Context.ConnectionId);

                if (role == UserRole.Pharmacist.ToString())
                {
                    await Clients.Group($"Managers-{pharmacyId}").SendAsync("PharmacistOffline", userId);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}