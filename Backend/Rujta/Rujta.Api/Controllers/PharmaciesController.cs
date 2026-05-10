using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.DTOs.PharmacyDtos;
using Rujta.Application.Interfaces.InterfaceServices.IPharmacy;
using Rujta.Infrastructure.Identity;
using System.ComponentModel.DataAnnotations;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class PharmaciesController : ControllerBase
    {
        private readonly IPharmacyService _pharmacyService;

        public PharmaciesController(IPharmacyService pharmacyService)
        {
            _pharmacyService = pharmacyService;
        }

        private bool TryGetPharmacyId(out int pharmacyId)
        {
            pharmacyId = 0;

            var claim = User.FindFirst("PharmacyId");
            if (claim == null)
                return false;

            return int.TryParse(claim.Value, out pharmacyId);
        }

        [HttpGet("nearest-routed")]
        [ProducesResponseType(typeof(IEnumerable<NearestPharmacyDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetNearestWithRouting([Range(-90, 90)] double userLat, [Range(-180, 180)] double userLon, [RegularExpression("^(car|walk)$")] string mode = "car", [Range(1, 20)] int topK = 5)
        {
            var result = await _pharmacyService
                .GetNearestPharmaciesRoutedAsync(userLat, userLon, mode, topK);

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPharmacies(CancellationToken cancellationToken)
        {
            var pharmacies = await _pharmacyService.GetAllPharmaciesAsync(cancellationToken);

            return Ok(pharmacies);
        }

        [HttpGet("medicine/{medicineId}/stock")]
        [Authorize(Roles = nameof(UserRole.PharmacyAdmin))]
        public async Task<IActionResult> GetMedicineStock([Range(1, int.MaxValue)] int medicineId)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var stock = await _pharmacyService.GetMedicineStockAsync(pharmacyId, medicineId);

            if (stock is null)
                return NotFound(new { message = "Medicine not found in this pharmacy" });

            return Ok(stock);
        }

        [HttpGet("medicines")]
        [Authorize(Roles = nameof(UserRole.PharmacyAdmin))]
        public async Task<IActionResult> GetAllMedicines()
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var medicines = await _pharmacyService.GetMedicinesByPharmacyAsync(pharmacyId);

            return Ok(medicines);
        }

        [HttpGet("medicines/paged")]
        [Authorize(Roles = nameof(UserRole.PharmacyAdmin))]
        public async Task<IActionResult> GetPagedMedicines([FromQuery, Range(1, int.MaxValue)] int pageNumber = 1, [FromQuery, Range(1, 100)] int pageSize = 16, [FromQuery] string? searchTerm = null, [FromQuery] int? categoryId = null, CancellationToken cancellationToken = default)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var result = await _pharmacyService.GetPagedMedicinesByPharmacyAsync(
                pharmacyId,
                pageNumber,
                pageSize,
                searchTerm,
                categoryId,
                cancellationToken);

            return Ok(result);
        }
    }
}