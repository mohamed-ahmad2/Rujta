using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.Interfaces.InterfaceServices;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Rujta.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // ✅ Fetch current user's notifications
        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var notifications = await _notificationService.GetUserNotificationsAsync(userId);
            return Ok(notifications);
        }

        // ✅ Mark notification as read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            await _notificationService.MarkAsReadAsync(id);
            return Ok(new { message = "Notification marked as read" });
        }

        // ✅ For testing notifications from Swagger easily
        [HttpPost("test")]
        public async Task<IActionResult> CreateTestNotification([FromBody] string message)
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            await _notificationService.SendNotificationAsync(
                userId,
                "Test Notification 🚀",
                !string.IsNullOrWhiteSpace(message) ? message : "Hello from SignalR!",
                payload: null
            );

            return Ok(new { message = "Test notification sent!" });
        }
    }
}
