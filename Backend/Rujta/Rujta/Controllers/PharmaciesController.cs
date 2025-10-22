using Microsoft.AspNetCore.Mvc;
using Rujta.Application.Services;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PharmaciesController : ControllerBase
    {
        private readonly PharmacyDistanceService _distanceService;

        public PharmaciesController(PharmacyDistanceService distanceService)
        {
            _distanceService = distanceService;
        }

        [HttpGet("nearest")]
        public IActionResult GetNearest(double userLat, double userLon, int topK = 10)
        {
            var nearest = _distanceService.GetNearestPharmacies(userLat, userLon, topK);
            return Ok(nearest.Select(n => new
            {
                n.pharmacy.Id,
                n.pharmacy.Name,
                DistanceKm = (n.distance / 1000).ToString("F2"),
                DurationMinutes = (n.duration / 60).ToString("F1")
            }));
        }
    }
}
