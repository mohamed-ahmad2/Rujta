using Microsoft.AspNetCore.RateLimiting;
using Rujta.Infrastructure.Constants;

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

        private const string PharmacyIdClaim = "PharmacyId";

        public NotificationController(
            INotificationService notificationService,
            ILogService logService)
        {
            _notificationService = notificationService;
            _logService = logService;
        }


        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = TryGetUserId();
            if (userId is null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var notifications =
                await _notificationService.GetUserNotificationsAsync(userId);

            await _logService.AddLogAsync(
                GetUserName(),
                NotificationMessages.FetchedNotifications);

            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = TryGetUserId();
            if (userId is null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var count = await _notificationService.GetUnreadCountAsync(userId);

            return Ok(new { unreadCount = count });
        }

        [HttpPut("{id:int}/read")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = TryGetUserId();
            if (userId is null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            await _notificationService.MarkAsReadAsync(id, userId);

            await _logService.AddLogAsync(
                GetUserName(),
                $"Marked notification ID={id} as read");

            return Ok(new
            {
                message = NotificationMessages.NotificationMarkedAsRead
            });
        }

        [HttpGet("pharmacy")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetPharmacyNotifications()
        {
            var pharmacyId = TryGetPharmacyId();
            if (pharmacyId is null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var notifications =
                await _notificationService.GetUserNotificationsAsync(pharmacyId);

            await _logService.AddLogAsync(
                GetUserName(),
                $"Fetched notifications for Pharmacy ID={pharmacyId}");

            return Ok(notifications);
        }

        [HttpGet("pharmacy/unread-count")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetPharmacyUnreadCount()
        {
            var pharmacyId = TryGetPharmacyId();
            if (pharmacyId is null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var count = await _notificationService.GetUnreadCountAsync(pharmacyId);

            return Ok(new { unreadCount = count });
        }

        [HttpPut("pharmacy/{id:int}/read")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> MarkPharmacyNotificationAsRead(int id)
        {
            var pharmacyId = TryGetPharmacyId();
            if (pharmacyId is null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            await _notificationService.MarkAsReadAsync(id, pharmacyId);

            await _logService.AddLogAsync(
                GetUserName(),
                $"Marked pharmacy notification ID={id} as read");

            return Ok(new
            {
                message = NotificationMessages.NotificationMarkedAsRead
            });
        }

        private string? TryGetUserId()
            => User.FindFirstValue(ClaimTypes.NameIdentifier);

        private string? TryGetPharmacyId()
            => User.FindFirstValue(PharmacyIdClaim);

        private string GetUserName()
            => User.Identity?.Name ?? NotificationMessages.UnknownUser;
    }
}