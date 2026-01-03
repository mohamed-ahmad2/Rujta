using Rujta.Application.DTOs.UserProfile;
using Rujta.Infrastructure.Constants;

namespace Rujta.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserRepository _userProfileService;

        public UserProfileController(IUserRepository userProfileService)
        {
            _userProfileService = userProfileService;
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

            var profile = await _userProfileService.GetProfileAsync(userId);

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

            var result = await _userProfileService.UpdateProfileAsync(userId, dto);

            if (!result)
                return BadRequest(UserProfileMessages.UpdateFailed);

            return Ok(UserProfileMessages.UpdateSuccess);
        }
    }
}