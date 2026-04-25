using Rujta.Application.DTOs.CustomerDtos;
using Rujta.Application.DTOs.OrderDto;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/pharmacies/{pharmacyId:int}/customers")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerOrderService _service;

        public CustomersController(ICustomerOrderService service)
        {
            _service = service;
        }

        // GET: api/pharmacies/1/customers
        [HttpGet]
        public async Task<IActionResult> GetAll(int pharmacyId)
        {
            var result = await _service.GetAllCustomersAsync();
            return Ok(result);
        }

        // GET: api/pharmacies/1/customers/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int pharmacyId, Guid id)
        {
            var customer = await _service.GetCustomerByIdAsync(id);
            if (customer == null)
                return NotFound();

            return Ok(customer);
        }

        // POST: api/pharmacies/1/customers
        [HttpPost]
        public async Task<IActionResult> Create(
            int pharmacyId,
            [FromBody] CreateCustomerDto dto)
        {
            dto.PharmacyId = pharmacyId;

            var result = await _service.CreateCustomerAsync(dto);
            return Ok(result);
        }

        // PUT: api/pharmacies/1/customers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int pharmacyId,
            Guid id,
            [FromBody] UpdateCustomerDto dto)
        {
            var updated = await _service.UpdateCustomerAsync(id, dto);

            if (updated == null)
                return NotFound();

            return Ok(updated);
        }

        // DELETE: api/pharmacies/1/customers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int pharmacyId, Guid id)
        {
            var deleted = await _service.DeleteCustomerAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }

        // GET: api/pharmacies/1/customers/stats
        [HttpGet("stats")]
        public async Task<IActionResult> Stats(int pharmacyId)
        {
            var stats = await _service.GetCustomerStatsAsync();
            return Ok(stats);
        }

        // POST: api/pharmacies/1/customers/order
        [HttpPost("order")]
        public async Task<IActionResult> CreateOrder(
            int pharmacyId,
            [FromBody] CreateCustomerOrderRequest request,
            CancellationToken cancellationToken)
        {
            request.PharmacyId = pharmacyId;

            var result = await _service.CreateCustomerOrderAsync(request, cancellationToken);
            return Ok(result);
        }

        // GET: api/pharmacies/1/customers/check?phoneNumber=010...
        [HttpGet("check")]
        public async Task<IActionResult> CheckCustomer(
            int pharmacyId,
            [FromQuery] string phoneNumber,
            CancellationToken cancellationToken)
        {
            var result = await _service.CheckCustomerByPhoneAsync(pharmacyId, phoneNumber, cancellationToken);
            return Ok(result);
        }
    }
}