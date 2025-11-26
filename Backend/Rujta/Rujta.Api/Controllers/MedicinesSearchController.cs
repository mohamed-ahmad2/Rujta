using Rujta.Infrastructure.Constants;

namespace Rujta.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]/search")]
    public class MedicinesSearchController : ControllerBase
    {
        private readonly ISearchMedicineService _searchMedicineService;
        private readonly ILogService _logService;

        public MedicinesSearchController(ISearchMedicineService searchMedicineService, ILogService logService)
        {
            _searchMedicineService = searchMedicineService;
            _logService = logService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> Search([FromQuery] string query, [FromQuery] int top = 10)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                await _logService.AddLogAsync(GetUser(), $"Attempted search with invalid query: '{query}'");
                return Ok(Enumerable.Empty<MedicineDto>());
            }

            var results = await _searchMedicineService.SearchAsync(query, top);
            await _logService.AddLogAsync(GetUser(), $"Searched medicines with query='{query}', returned {results.Count()} results");

            return Ok(results);
        }

        private string GetUser() => User.Identity?.Name ?? AuthMessages.UnknownUser;
    }

}
