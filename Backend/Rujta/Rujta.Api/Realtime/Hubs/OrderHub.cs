using Microsoft.AspNetCore.SignalR;

namespace Rujta.API.Realtime.Hubs
{
    public class OrderHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var pharmacyId = Context.User?.FindFirst("PharmacyId")?.Value;

            if (!string.IsNullOrEmpty(pharmacyId))
                await Groups.AddToGroupAsync(Context.ConnectionId,$"Pharmacy-{pharmacyId}");
            
            await base.OnConnectedAsync();
        }
    }
}
