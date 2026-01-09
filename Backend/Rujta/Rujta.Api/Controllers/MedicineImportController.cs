using Microsoft.AspNetCore.RateLimiting;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class MedicineImportController : ControllerBase
    {
        private readonly MedicineDataImportService _importService;

        public MedicineImportController(MedicineDataImportService importService)
        {
            _importService = importService;
        }

        [HttpPost]
        public async Task<IActionResult> ImportMedicines([FromQuery] int limit = 50)
        {
            await _importService.ImportMedicinesAsync(limit);
            return Ok($"Imported {limit} medicines successfully.");
        }
    }

}
