using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
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
        private readonly IUserRepository _userRepo;

        public NotificationController(INotificationService notificationService, IUserRepository userRepo)
        {
            _notificationService = notificationService;
            _userRepo = userRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var notifications = await _notificationService.GetUserNotificationsAsync(userId);
            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            await _notificationService.MarkAsReadAsync(id);
            return Ok();
        }

        [HttpPost("test")]
        public async Task<IActionResult> CreateTestNotification([FromBody] string message)
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return NotFound("User not found");

            await _notificationService.SendNotificationAsync(
                user,
                "Test Notification",
                message ?? "Hello from SignalR!"
            );

            return Ok("Notification sent!");
        }
    }
}
