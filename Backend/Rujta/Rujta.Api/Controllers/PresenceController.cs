using Microsoft.AspNetCore.RateLimiting;
using Rujta.Domain.Interfaces;
using Rujta.Infrastructure.Identity;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)}")]
    public class PresenceController : ControllerBase
    {
        private readonly IUserPresenceService _presenceService;
        private readonly IPharmacistManagementService _pharmacistService;
        private readonly UserManager<ApplicationUser> _userManager;

        public PresenceController(IUserPresenceService presenceService,IPharmacistManagementService pharmacistService,UserManager<ApplicationUser> userManager)
        {
            _presenceService = presenceService;
            _pharmacistService = pharmacistService;
            _userManager = userManager;
        }

        [HttpGet("online-pharmacists/{pharmacyId}")]
        [ProducesResponseType(typeof(IEnumerable<string>), 200)]
        public async Task<IActionResult> GetOnlinePharmacists()
        {
            var pharmacyIdClaim = User.FindFirst("PharmacyId");
            if (pharmacyIdClaim == null)
                return Unauthorized("Pharmacy context missing.");

            int pharmacyId = int.Parse(pharmacyIdClaim.Value);

            var onlineUsers = _presenceService.GetOnlinePharmacists(pharmacyId.ToString());
            var userIds = new List<string>();

            foreach (var onlineUserId in onlineUsers)
            {
                if (Guid.TryParse(onlineUserId, out var guid))
                {
                    var appUser = await _userManager.FindByIdAsync(guid.ToString());
                    if (appUser != null)
                    {
                        userIds.Add(appUser.DomainPersonId.ToString());
                    }
                }
            }
            var pharmacists = await _pharmacistService.GetPharmacistsByIdsAsync(userIds);
            return Ok(pharmacists);
        }
    }
}