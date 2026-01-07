using Azure.Core;
using Microsoft.AspNetCore.RateLimiting;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/pharmacies/{pharmacyId}/customers")]
    [EnableRateLimiting("Fixed")]
    public class CustomerOrdersController : ControllerBase
    {
        private readonly ICustomerOrderService _service;

        public CustomerOrdersController(ICustomerOrderService service)
        {
            _service = service;
        }

        [HttpPost("order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateCustomerOrderRequest request,CancellationToken cancellationToken)
        {
            request.PharmacyId = GetCurrentPharmacyId();

            var result = await _service
                .CreateCustomerOrderAsync(request, cancellationToken);

            return Ok(result);
        }

        [HttpGet("check")]
        public async Task<IActionResult> CheckCustomer([FromQuery] string phoneNumber,CancellationToken cancellationToken)
        {
            int pharmacyId = GetCurrentPharmacyId();
            var result = await _service.CheckCustomerByPhoneAsync(pharmacyId, phoneNumber, cancellationToken);
            return Ok(result);
        }

        private int GetCurrentPharmacyId()
        {
            var claim = User.FindFirstValue("PharmacyId");

            if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var pharmacyId))
                throw new UnauthorizedAccessException("Invalid PharmacyId claim.");

            return pharmacyId;
        }
    }
}
