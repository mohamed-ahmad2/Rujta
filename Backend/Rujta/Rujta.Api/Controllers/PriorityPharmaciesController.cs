using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.Interfaces;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

namespace Rujta.API.Controllers
{
    [Authorize(Roles = nameof(UserRole.User))]
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class PriorityPharmaciesController : ControllerBase
    {
        private readonly IPharmacyCartService _cartService;
        private readonly IUnitOfWork _unitOfWork;

        private const double CoordinateTolerance = 0.000001;

        public PriorityPharmaciesController(
            IPharmacyCartService cartService,
            IUnitOfWork unitOfWork)
        {
            _cartService = cartService;
            _unitOfWork = unitOfWork;
        }

        [HttpPost("top-k")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTopPharmaciesForCart(
            [FromBody] ItemDto order,
            [FromQuery] int addressId,
            [FromQuery] int topK = 5,
            CancellationToken cancellationToken = default)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var userId = Guid.Parse(userIdClaim);

            var addresses = await _unitOfWork.Address.GetUserAddressesAsync(userId, cancellationToken);
            if (!addresses.Any())
                return BadRequest(ApiMessages.UserLocationNotSet);

            var address = addresses.FirstOrDefault(a => a.Id == addressId);
            if (address == null)
                return NotFound("Address Not Found");

            if (Math.Abs(address.Latitude) < CoordinateTolerance ||
                Math.Abs(address.Longitude) < CoordinateTolerance)
                return BadRequest(ApiMessages.UserLocationNotSet);

            var pharmacies = await _cartService.GetTopPharmaciesForCartAsync(
                order,
                address.Latitude,
                address.Longitude,
                topK);

            return Ok(pharmacies);
        }
    }
}
