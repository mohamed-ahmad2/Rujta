using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.DTOs.OrderDto;
using Rujta.Application.Interfaces.InterfaceServices.IGeocoding;
using Rujta.Application.Interfaces.InterfaceServices.IPharmacy;

namespace Rujta.API.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class PublicPharmacyController : ControllerBase
    {
        private readonly IPharmacyCartService _cartService;
        private readonly IGeocodingService _geocodingService;

        public PublicPharmacyController(
            IPharmacyCartService cartService,
            IGeocodingService geocodingService)
        {
            _cartService = cartService;
            _geocodingService = geocodingService;
        }

        [HttpPost("nearest")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetNearestPharmacies(
            [FromBody] PublicPharmacySearchRequest request,
            [FromQuery] int topK = 5,
            [FromQuery] int? maxShortageRange = null,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.Street) ||
                string.IsNullOrWhiteSpace(request.City) ||
                string.IsNullOrWhiteSpace(request.Governorate))
                return BadRequest("Street, city, and governorate are all required.");

            if (request.Items == null || !request.Items.Any())
                return BadRequest("At least one medicine item is required.");

            try
            {
                var coords = await _geocodingService.GetCoordinatesAsync(
                    $"{request.Street}, {request.City}, {request.Governorate}, Egypt",
                    cancellationToken);

                var order = new ItemDto
                {
                    Items = request.Items,
                    MaxShortageRange = maxShortageRange
                };

                var pharmacies = await _cartService.GetTopPharmaciesForCartAsync(
                    order,
                    coords.Latitude,
                    coords.Longitude,
                    topK);

                return Ok(pharmacies);
            }
            catch
            {
                return BadRequest("Could not resolve the provided address. Please check and try again.");
            }
        }
    }
}
