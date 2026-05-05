using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;

namespace Rujta.API.Realtime.Hubs
{
    [Authorize]
    [EnableRateLimiting("Fixed")]
    public class OrderHub : Hub
    {
        private readonly IOrderService _orderService;

        public OrderHub(IOrderService orderService)
        {
            _orderService = orderService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("domainPersonId")?.Value;

            var pharmacyId =
                Context.User?.FindFirst("PharmacyId")?.Value;

            // User group
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(
                    Context.ConnectionId,
                    $"User-{userId}");
            }

            // Pharmacy staff group
            if (!string.IsNullOrEmpty(pharmacyId))
            {
                await Groups.AddToGroupAsync(
                    Context.ConnectionId,
                    $"Pharmacy-{pharmacyId}");
            }

            await base.OnConnectedAsync();
        }

        // Join order details realtime
        public async Task JoinOrder(int orderId)
        {
            var userId =
                Context.User?.FindFirst("domainPersonId")?.Value;

            var pharmacyId =
                Context.User?.FindFirst("PharmacyId")?.Value;

            var allowed =
                await _orderService
                    .CanAccessOrderAsync(orderId, userId, pharmacyId);

            if (!allowed)
                throw new HubException("Unauthorized");

            await Groups.AddToGroupAsync(
                Context.ConnectionId,
                $"Order-{orderId}");
        }

        public async Task LeaveOrder(int orderId)
        {
            await Groups.RemoveFromGroupAsync(
                Context.ConnectionId,
                $"Order-{orderId}");
        }
    }
}