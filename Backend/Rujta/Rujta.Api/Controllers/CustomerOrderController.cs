using Rujta.Application.DTOs.CustomerDtos;
using Rujta.Application.DTOs.OrderDto;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/customers")]
    [Authorize] // IMPORTANT
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerOrderService _service;

        public CustomersController(ICustomerOrderService service)
        {
            _service = service;
        }

        private bool TryGetPharmacyId(out int pharmacyId)
        {
            pharmacyId = 0;
            var claim = User.FindFirst("PharmacyId");
            if (claim == null) return false;
            return int.TryParse(claim.Value, out pharmacyId);
        }

        // GET: api/customers
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var result = await _service.GetAllCustomersAsync(pharmacyId);
            return Ok(result);
        }

        // GET: api/customers/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var customer = await _service.GetCustomerByIdAsync(pharmacyId, id);

            if (customer == null)
                return NotFound();

            return Ok(customer);
        }

        // POST: api/customers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            dto.PharmacyId = pharmacyId;

            var result = await _service.CreateCustomerAsync(dto);
            return Ok(result);
        }

        // PUT: api/customers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerDto dto)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var updated = await _service.UpdateCustomerAsync(pharmacyId, id, dto);

            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // DELETE: api/customers/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var deleted = await _service.DeleteCustomerAsync(pharmacyId, id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }

        // GET: api/customers/stats
        [HttpGet("stats")]
        public async Task<IActionResult> Stats()
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var stats = await _service.GetCustomerStatsAsync(pharmacyId);
            return Ok(stats);
        }

        // POST: api/customers/order
        [HttpPost("order")]
        public async Task<IActionResult> CreateOrder(
            [FromBody] CreateCustomerOrderRequest request,
            CancellationToken cancellationToken)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            request.PharmacyId = pharmacyId;

            var result = await _service.CreateCustomerOrderAsync(request, cancellationToken);
            return Ok(result);
        }


        [HttpGet("check")]
        public async Task<IActionResult> CheckCustomer(
            [FromQuery] string phoneNumber,
            CancellationToken cancellationToken)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var result = await _service.CheckCustomerByPhoneAsync(pharmacyId, phoneNumber, cancellationToken);
            return Ok(result);
        }
    }
}