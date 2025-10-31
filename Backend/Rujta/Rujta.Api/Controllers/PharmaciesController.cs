﻿using Microsoft.AspNetCore.Mvc;
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

        [HttpGet("nearest-routed")]
        [ProducesResponseType(typeof(IEnumerable<object>), StatusCodes.Status200OK)]
        public IActionResult GetNearestWithRouting(double userLat, double userLon, string mode = "car", int topK = 5)
        {
            var result = _distanceService.GetNearestPharmaciesRouted(userLat, userLon, mode, topK);

            return Ok(result.Select(r => new
            {
                id = r.pharmacy.Id,
                name = r.pharmacy.Name,
                distanceMeters = Math.Round(r.distanceMeters, 2),
                durationMinutes = Math.Round(r.durationMinutes, 1),
                mode
            }));
        }
    }
}
