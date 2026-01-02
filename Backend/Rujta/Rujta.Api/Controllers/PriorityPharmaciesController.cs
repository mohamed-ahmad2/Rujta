using Rujta.Application.Interfaces;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;


namespace Rujta.API.Controllers
{
    [Authorize(Roles = nameof(UserRole.User))]
    [ApiController]
    [Route("api/[controller]")]
    public class PriorityPharmaciesController : ControllerBase
    {
        private readonly IPharmacyCartService _cartService;
        private readonly IUnitOfWork _unitOfWork;

        public PriorityPharmaciesController(IPharmacyCartService cartService, IUnitOfWork unitOfWork)
        {
            _cartService = cartService;
            _unitOfWork = unitOfWork;
        }

        [HttpPost("top-k")]
        [ProducesResponseType(typeof(object), 200)]
        public async Task<IActionResult> GetTopPharmaciesForCart([FromBody] ItemDto order, [FromQuery] int topK = 5)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized(ApiMessages.UnauthorizedAccess);

            var userId = Guid.Parse(userIdClaim);

            
            var user = await _unitOfWork.Users.GetProfileAsync(userId);
            if (user == null) return NotFound(ApiMessages.UserNotFound);

            if (user.Latitude == null || user.Longitude == null)
                return BadRequest(ApiMessages.UserLocationNotSet);

            Console.WriteLine("Order content:");

            foreach (var item in order.Items)
            {
                Console.WriteLine($"MedicineId: {item.MedicineId}, Quantity: {item.Quantity}");
            }


            var pharmacies = await _cartService.GetTopPharmaciesForCartAsync(
    order,
    user.Latitude.Value,
    user.Longitude.Value,
    topK);

            return Ok(pharmacies);

        }

    }
}
