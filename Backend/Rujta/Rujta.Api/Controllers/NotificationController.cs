using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Infrastructure.Constants;
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
        private readonly ILogService _logService;

        public NotificationController(INotificationService notificationService, ILogService logService)
        {
            _notificationService = notificationService;
            _logService = logService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var notifications = await _notificationService.GetUserNotificationsAsync(userId);

            await _logService.AddLogAsync(GetUser(), NotificationMessages.FetchedNotifications);

            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            await _notificationService.MarkAsReadAsync(id);
            await _logService.AddLogAsync(GetUser(), $"Marked notification ID={id} as read");

            return Ok(new { message = NotificationMessages.NotificationMarkedAsRead });
        }

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

            await _logService.AddLogAsync(GetUser(), LogConstants.SentTestNotification);

            return Ok(new { message = NotificationMessages.SentTestNotification });
        }

        private string GetUser()
        {
            return User.Identity?.Name ?? NotificationMessages.UnknownUser;
        }
    }
}
