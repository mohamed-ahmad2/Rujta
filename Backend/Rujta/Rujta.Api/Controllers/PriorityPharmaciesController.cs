using Rujta.Infrastructure.Constants;
using System.IdentityModel.Tokens.Jwt;


namespace Rujta.API.Controllers
{
    [Authorize] 
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
        public async Task<IActionResult> GetTopPharmaciesForCart([FromBody] ItemDto order, [FromQuery] int topK = 5)
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (userIdClaim == null) return Unauthorized(ApiMessages.UnauthorizedAccess);

            var userId = Guid.Parse(userIdClaim);

            
            var user = await _userRepository.GetProfileAsync(userId);
            if (user == null) return NotFound(ApiMessages.UserNotFound);

            
            if (user.Latitude == null || user.Longitude == null)
                return BadRequest(ApiMessages.UserLocationNotSet);

            
            var pharmacies = await _cartService.GetTopPharmaciesForCartAsync(
                order,
                user.Latitude.Value,  
                user.Longitude.Value,
                topK);

           
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
