namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/pharmacies/{pharmacyId}/customers")]
    public class CustomerOrdersController : ControllerBase
    {
        private readonly ICustomerOrderService _service;

        public CustomerOrdersController(ICustomerOrderService service)
        {
            _service = service;
        }

        [HttpPost("order")]
        public async Task<IActionResult> CreateOrder(
            int pharmacyId,
            [FromBody] CreateCustomerOrderRequest request,
            CancellationToken cancellationToken)
        {
            request.PharmacyId = pharmacyId;

            var result = await _service
                .CreateCustomerOrderAsync(request, cancellationToken);

            return Ok(result);
        }
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
