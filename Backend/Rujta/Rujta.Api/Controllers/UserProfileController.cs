using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs.UserProfile;
using Rujta.Application.Interfaces.InterfaceRepositories;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Rujta.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;

        public UserProfileController(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim);
            var profile = await _userProfileService.GetProfileAsync(userId);

            if (profile == null)
                return NotFound("User not found.");

            return Ok(profile);
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim);
            var result = await _userProfileService.UpdateProfileAsync(userId, dto);

            if (!result)
                return BadRequest("Failed to update profile.");

            return Ok("Profile updated successfully.");
        }
    }
}
