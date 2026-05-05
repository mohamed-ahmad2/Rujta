using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.DTOs.Common;
using Rujta.Application.DTOs.MedicineDtos;
using Rujta.Application.DTOs.PharmacyDtos;
using Rujta.Application.Interfaces.InterfaceServices.IPharmacy;
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

        [HttpGet("nearest-routed")]
        [ProducesResponseType(typeof(IEnumerable<NearestPharmacyDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetNearestWithRouting([Range(-90, 90)] double userLat, [Range(-180, 180)] double userLon,[RegularExpression("^(car|walk)$")] string mode = "car",[Range(1, 20)] int topK = 5)
        {
            var result = await _pharmacyService
                .GetNearestPharmaciesRoutedAsync(userLat, userLon, mode, topK);

            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<PharmacyDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllPharmacies(CancellationToken cancellationToken)
        {
            var pharmacies = await _pharmacyService.GetAllPharmaciesAsync(cancellationToken);

            return Ok(pharmacies);
        }

        [AllowAnonymous]
        [HttpGet("{pharmacyId}/medicine/{medicineId}/stock")]
        [ProducesResponseType(typeof(MedicineStockDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetMedicineStock([Range(1, int.MaxValue)] int pharmacyId,[Range(1, int.MaxValue)] int medicineId)
        {
            var stock = await _pharmacyService
                .GetMedicineStockAsync(pharmacyId, medicineId);

            if (stock is null)
                return NotFound(new { message = "Pharmacy or Medicine not found" });

            return Ok(stock);
        }

        [AllowAnonymous]
        [HttpGet("{pharmacyId}/medicines")]
        [ProducesResponseType(typeof(IEnumerable<MedicineDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAllMedicines([Range(1, int.MaxValue)] int pharmacyId)
        {
            var medicines = await _pharmacyService
                .GetMedicinesByPharmacyAsync(pharmacyId);

            return Ok(medicines);
        }

        [AllowAnonymous]
        [HttpGet("{pharmacyId}/medicines/paged")]
        [ProducesResponseType(typeof(PagedResultDto<MedicineDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPagedMedicines([Range(1, int.MaxValue)] int pharmacyId,[FromQuery, Range(1, int.MaxValue)] int pageNumber = 1,[FromQuery, Range(1, 100)] int pageSize = 16,[FromQuery] string? searchTerm = null,[FromQuery] int? categoryId = null,CancellationToken cancellationToken = default)
        {
            var result = await _pharmacyService.GetPagedMedicinesByPharmacyAsync(
                pharmacyId, pageNumber, pageSize, searchTerm, categoryId, cancellationToken);

            return Ok(result);
        }
    }
}