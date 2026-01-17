using Microsoft.AspNetCore.RateLimiting;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

namespace Rujta.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [EnableRateLimiting("Fixed")]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserService _userProfileService;
        private readonly UserManager<ApplicationUser> _userManager;

        public UserProfileController(
            IUserService userProfileService,
            UserManager<ApplicationUser> userManager)
        {
            _userProfileService = userProfileService;
            _userManager = userManager;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = User.FindFirstValue(ClaimTypes.Email);
            Console.WriteLine(userIdClaim);
            Console.WriteLine(email);
            if (string.IsNullOrEmpty(userIdClaim))
            {
                Console.WriteLine("empty");
                Console.WriteLine(userIdClaim);
                return Unauthorized(ApiMessages.UnauthorizedAccess);
            }
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                Console.WriteLine("parse");
                return Unauthorized(ApiMessages.UnauthorizedAccess);
            }

            var appUser = await _userManager.FindByIdAsync(userId.ToString());
            if (appUser == null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var profile = await _userProfileService.GetProfileAsync(appUser.Id, appUser.DomainPersonId);
            if (profile == null)
                return NotFound(UserProfileMessages.UserNotFound);
            return Ok(profile);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var appUser = await _userManager.FindByIdAsync(userId.ToString());
            if (appUser == null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var result = await _userProfileService.UpdateProfileAsync(appUser.Id, appUser.DomainPersonId, dto);
            if (!result)
                return BadRequest(UserProfileMessages.UpdateFailed);
            return Ok(UserProfileMessages.UpdateSuccess);
        }
    }
}