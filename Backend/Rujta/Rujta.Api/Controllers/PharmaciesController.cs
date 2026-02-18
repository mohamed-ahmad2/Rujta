using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.Interfaces.InterfaceServices.IPharmacy;
using Rujta.Application.Services.Pharmcy;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class PharmaciesController : ControllerBase
    {
        private readonly PharmacyDistanceService _distanceService;
        private readonly IPharmacyRepository _pharmacyRepo;

        public PharmaciesController(
            PharmacyDistanceService distanceService,
            IPharmacyRepository pharmacyRepo)   
        {
            _distanceService = distanceService;
            _pharmacyRepo = pharmacyRepo;
        }

        [HttpGet("nearest-routed")]
        [ProducesResponseType(typeof(IEnumerable<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetNearestWithRouting(
            double userLat,
            double userLon,
            string mode = "car",
            int topK = 5)
        {
            var result = await _distanceService
                .GetNearestPharmaciesRouted(userLat, userLon, mode, topK);

            return Ok(result.Select(r => new
            {
                id = r.pharmacy.Id,
                name = r.pharmacy.Name,
                distanceMeters = Math.Round(r.distanceMeters, 2),
                durationMinutes = Math.Round(r.durationMinutes, 1),
                mode
            }));
        }
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAllPharmacies()
        {
            var pharmacies = await _pharmacyRepo.GetAllPharmacies();
            return Ok(pharmacies);
        }

        [AllowAnonymous]
        [HttpGet("{pharmacyId}/medicine/{medicineId}/stock")]
        public async Task<IActionResult> GetMedicineStock(int pharmacyId, int medicineId)
        {
            var stock = await _pharmacyRepo.GetMedicineStockAsync(pharmacyId, medicineId);
            return Ok(new { PharmacyId = pharmacyId, MedicineId = medicineId, Stock = stock });
        }

        [AllowAnonymous]
        [HttpGet("{pharmacyId}/medicines")]
        public async Task<IActionResult> GetAllMedicineIds(int pharmacyId)
        {
            var medicineIds = await _pharmacyRepo.GetAllMedicineIdsAsync(pharmacyId);
            return Ok(medicineIds); // returns JSON array of IDs
        }

    }
}
