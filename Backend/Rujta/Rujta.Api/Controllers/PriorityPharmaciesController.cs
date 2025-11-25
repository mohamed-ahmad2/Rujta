using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Application.Interfaces.InterfaceServices;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace Rujta.API.Controllers
{
    [Authorize] // User must be logged in
    [ApiController]
    [Route("api/[controller]")]
    public class PriorityPharmaciesController : ControllerBase
    {
        private readonly IPharmacyCartService _cartService;
        private readonly IUserRepository _userRepository;

        public PriorityPharmaciesController(IPharmacyCartService cartService, IUserRepository userRepository)
        {
            _cartService = cartService;
            _userRepository = userRepository;
        }

        [HttpPost("top-k")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> GetTopPharmaciesForCart(
    [FromBody] ItemDto order,
    [FromQuery] int topK = 5)
        {
            // Step 1: Get logged-in user ID from JWT
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (userIdClaim == null) return Unauthorized();

            var userId = Guid.Parse(userIdClaim);

            // Step 2: Get user profile
            var user = await _userRepository.GetProfileAsync(userId);
            if (user == null) return NotFound("User not found.");

            // Step 2b: Ensure user has location
            if (user.Latitude == null || user.Longitude == null)
                return BadRequest("User location is not set.");

            // Step 3: Get top-K nearest pharmacies sorted by available items
            var pharmacies = await _cartService.GetTopPharmaciesForCartAsync(
                order,
                user.Latitude.Value,   // safely convert from double? to double
                user.Longitude.Value,
                topK);

            // Step 4: Prepare result for frontend
            var result = pharmacies.Select(p => new
            {
                id = p.Id,
                name = p.Name,
                latitude = p.Latitude,
                longitude = p.Longitude,
                contactNumber = p.ContactNumber
            });

            return Ok(result);
        }

    }
}
