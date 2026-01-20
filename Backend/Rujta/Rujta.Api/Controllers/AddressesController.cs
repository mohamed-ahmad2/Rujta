using Microsoft.AspNetCore.RateLimiting;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

namespace Rujta.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class AddressesController : ControllerBase
    {
        private readonly IAddressService _addressService;
        private readonly ILogService _logService;
        private readonly UserManager<ApplicationUser> _userManager;

        public AddressesController(
            IAddressService addressService,
            ILogService logService,
            UserManager<ApplicationUser> userManager)
        {
            _addressService = addressService;
            _logService = logService;
            _userManager = userManager;
        }

        private string GetUser() =>
            User.Identity?.Name ?? LogConstants.UnknownUser;


        [Authorize(Roles = nameof(UserRole.SuperAdmin))]
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var addresses = await _addressService.GetAllAsync(cancellationToken);
            await _logService.AddLogAsync(GetUser(), "Fetched all addresses");
            return Ok(addresses);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var address = await _addressService.GetByIdAsync(id, cancellationToken);

            if (address == null)
                return NotFound(new { message = "Address not found" });

            await _logService.AddLogAsync(GetUser(), $"Fetched address ID={id}");
            return Ok(address);
        }


        [Authorize(Roles = nameof(UserRole.User))]
        [HttpGet("user")]
        public async Task<IActionResult> GetUserAddresses(CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("DomainPersonId not found in token.");

            if (!Guid.TryParse(userIdClaim, out var userId))
                return BadRequest("Invalid DomainPersonId.");

            var appUser = await _userManager.FindByIdAsync(userId.ToString());
            if (appUser == null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var addresses = await _addressService
                .GetUserAddressesAsync(userId, appUser.DomainPersonId, cancellationToken);

            await _logService.AddLogAsync(GetUser(), "Fetched user addresses");

            return Ok(addresses);
        }


        [Authorize(Roles = nameof(UserRole.User))]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddressDto dto,CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var userGuid = Guid.Parse(userIdClaim);

            var appUser = await _userManager.FindByIdAsync(userGuid.ToString());
            if (appUser == null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            await _addressService.AddByUserAsync(appUser.DomainPersonId, dto, cancellationToken);
            await _logService.AddLogAsync(GetUser(), "Created new address");
            return Ok(new { message = "Address created successfully" });
        }


        [Authorize(Roles = nameof(UserRole.User))]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id,[FromBody] AddressDto dto,CancellationToken cancellationToken)
        {
            try
            {
                await _addressService.UpdateAsync(id, dto, cancellationToken);
                await _logService.AddLogAsync(GetUser(), $"Updated address ID={id}");
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [Authorize(Roles = nameof(UserRole.User))]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            try
            {
                await _addressService.DeleteAsync(id, cancellationToken);
                await _logService.AddLogAsync(GetUser(), $"Deleted address ID={id}");
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
