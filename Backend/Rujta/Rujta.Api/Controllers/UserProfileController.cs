using Rujta.Application.DTOs.UserProfile;
using Rujta.Infrastructure.Constants;
using System.IdentityModel.Tokens.Jwt;

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
            var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var profile = await _userProfileService.GetProfileAsync(userId);

            if (profile == null)
                return NotFound(UserProfileMessages.UserNotFound);

            return Ok(profile);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
        {
            var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var result = await _userProfileService.UpdateProfileAsync(userId, dto);

            if (!result)
                return BadRequest(UserProfileMessages.UpdateFailed);

            return Ok(UserProfileMessages.UpdateSuccess);
        }
    }
}