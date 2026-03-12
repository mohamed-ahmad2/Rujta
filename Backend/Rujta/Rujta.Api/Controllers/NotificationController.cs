using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using Rujta.Infrastructure.Constants;
using System.Security.Claims;

namespace Rujta.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [EnableRateLimiting("Fixed")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogService _logService;

        public NotificationController(
            INotificationService notificationService,
            ILogService logService)
        {
            _notificationService = notificationService;
            _logService = logService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            string userId = GetUserId();

            var notifications =
                await _notificationService.GetUserNotificationsAsync(userId);

            await _logService.AddLogAsync(
                GetUserName(),
                NotificationMessages.FetchedNotifications);

            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            string userId = GetUserId();
            var count = await _notificationService.GetUnreadCountAsync(userId);

            return Ok(new { unreadCount = count });
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            string userId = GetUserId();

            await _notificationService.MarkAsReadAsync(id, userId);

            await _logService.AddLogAsync(
                GetUserName(),
                $"Marked notification ID={id} as read");

            return Ok(new
            {
                message = NotificationMessages.NotificationMarkedAsRead
            });
        }

        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? throw new UnauthorizedAccessException();
        }

        private string GetUserName()
        {
            return User.Identity?.Name ?? NotificationMessages.UnknownUser;
        }
        


    }

   
}