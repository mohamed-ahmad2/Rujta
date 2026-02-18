using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.Interfaces.InterfaceServices.IMedicine;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/medicines/search")]
    [EnableRateLimiting("Fixed")]
    public class MedicinesSearchController : ControllerBase
    {
        private readonly ISearchMedicineService _searchMedicineService;
        private readonly ILogService _logService;
        private readonly UserManager<ApplicationUser> _userManager;

        public MedicinesSearchController(ISearchMedicineService searchMedicineService, ILogService logService, UserManager<ApplicationUser> userManager)
        {
            _searchMedicineService = searchMedicineService;
            _logService = logService;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> Search([FromQuery] string query, [FromQuery] int top = 10)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                await _logService.AddLogAsync(GetUser(), $"Attempted search with invalid query: '{query}'");
                return Ok(Enumerable.Empty<MedicineDto>());
            }

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var userGuid = Guid.Parse(userIdClaim);

            var appUser = await _userManager.FindByIdAsync(userGuid.ToString());
            if (appUser == null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var results = await _searchMedicineService.SearchAsync(query, appUser.DomainPersonId, top);
            await _logService.AddLogAsync(GetUser(), $"Searched medicines with query='{query}', returned {results.Count()} results");

            return Ok(results);
        }

        private string GetUser() => User.Identity?.Name ?? AuthMessages.UnknownUser;
    }

}