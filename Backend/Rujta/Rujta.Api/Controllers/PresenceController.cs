using Microsoft.AspNetCore.RateLimiting;
using Rujta.Domain.Interfaces;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class PresenceController : ControllerBase
    {
        private readonly IUserPresenceService _presenceService;

        public PresenceController(IUserPresenceService presenceService)
        {
            _presenceService = presenceService;
        }

        [HttpGet("online-pharmacists/{pharmacyId}")]
        [ProducesResponseType(typeof(IEnumerable<string>), 200)]
        //[Authorize(Roles = "PharmacyAdmin")]
        public IActionResult GetOnlinePharmacists(int pharmacyId)
        {
            var onlineUsers = _presenceService.GetOnlinePharmacists(pharmacyId.ToString());
            return Ok(onlineUsers);
        }
    }
}