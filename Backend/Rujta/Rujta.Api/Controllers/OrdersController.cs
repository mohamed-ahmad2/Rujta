using Rujta.Application.Constants;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

namespace Rujta.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogService _logService;
        private readonly UserManager<ApplicationUser> _userManager;

        public OrdersController(IOrderService orderService, ILogService logService, UserManager<ApplicationUser> userManager)
        {
            _orderService = orderService;
            _logService = logService;
            _userManager = userManager;
        }

        private string GetUser() => User.Identity?.Name ?? LogConstants.UnknownUser;

        // Create a new order
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto createOrderDto)
        {
            try
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized(ApiMessages.UnauthorizedAccess);

                var userGuid = Guid.Parse(userIdClaim);

                var appUser = await _userManager.FindByIdAsync(userGuid.ToString());
                if (appUser == null)
                    return Unauthorized(ApiMessages.UnauthorizedAccess);

                var order = await _orderService.CreateOrderAsync(createOrderDto, appUser.DomainPersonId);

                await _logService.AddLogAsync(GetUser(), $"Order {order.Id} created successfully for UserId {appUser.DomainPersonId}");
                
                return Ok(order);
            }
            catch (InvalidOperationException ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Invalid operation while creating order: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Unexpected error while creating order: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }

        }

        // Get all orders
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var orders = await _orderService.GetAllAsync(cancellationToken);
            await _logService.AddLogAsync(GetUser(), "Fetched all orders");
            return Ok(orders);
        }

        // Get order by ID
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var order = await _orderService.GetByIdAsync(id, cancellationToken);

            if (order == null)
                return NotFound(new { message = OrderMessages.OrderNotFound });

            await _logService.AddLogAsync(GetUser(), $"Fetched order ID={id}");
            return Ok(order);
        }

        // Update an order
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderDto dto, CancellationToken cancellationToken)
        {
            var existingOrder = await _orderService.GetByIdAsync(id, cancellationToken);

            if (existingOrder == null)
                return NotFound(new { message = OrderMessages.OrderNotFound });

            await _orderService.UpdateAsync(id, dto, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Updated order ID={id}");

            return NoContent();
        }

        // Delete an order
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var existingOrder = await _orderService.GetByIdAsync(id, cancellationToken);

            if (existingOrder == null)
                return NotFound(new { message = OrderMessages.OrderNotFound });

            await _orderService.DeleteAsync(id, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Deleted order ID={id}");

            return NoContent();
        }

        // Accept order
        [HttpPut("{id:int}/accept")]
        public async Task<IActionResult> Accept(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.AcceptOrderAsync(id, cancellationToken);

            if (result.success)
                await _logService.AddLogAsync(GetUser(), $"Accepted order ID={id}");

            return result.success ? Ok(result) : BadRequest(result);
        }

        // Process order
        [HttpPut("{id:int}/process")]
        public async Task<IActionResult> Process(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.ProcessOrderAsync(id, cancellationToken);

            if (result.success)
                await _logService.AddLogAsync(GetUser(), $"Processed order ID={id}");

            return result.success ? Ok(result) : BadRequest(result);
        }

        // Out for delivery
        [HttpPut("{id:int}/out-for-delivery")]
        public async Task<IActionResult> OutForDelivery(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.OutForDeliveryAsync(id, cancellationToken);

            if (result.success)
                await _logService.AddLogAsync(GetUser(), $"Order ID={id} is out for delivery");

            return result.success ? Ok(result) : BadRequest(result);
        }

        // Mark as delivered
        [HttpPut("{id:int}/delivered")]
        public async Task<IActionResult> MarkAsDelivered(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.MarkAsDeliveredAsync(id, cancellationToken);

            if (result.success)
                await _logService.AddLogAsync(GetUser(), $"Order ID={id} marked as delivered");

            return result.success ? Ok(result) : BadRequest(result);
        }

        // Cancel by user
        [HttpPut("{id:int}/cancel/user")]
        public async Task<IActionResult> CancelByUser(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.CancelOrderByUserAsync(id, cancellationToken);

            if (result.success)
                await _logService.AddLogAsync(GetUser(), $"User cancelled order ID={id}");

            return result.success ? Ok(result) : BadRequest(result);
        }

        // Cancel by pharmacy
        [HttpPut("{id:int}/cancel/pharmacy")]
        public async Task<IActionResult> CancelByPharmacy(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.CancelOrderByPharmacyAsync(id, cancellationToken);

            if (result.success)
                await _logService.AddLogAsync(GetUser(), $"Pharmacy cancelled order ID={id}");

            return result.success ? Ok(result) : BadRequest(result);
        }

        // Get all orders of logged-in user
        [HttpGet("user")]
        
        public async Task<IActionResult> GetUserOrders(CancellationToken cancellationToken)
        {
            var domainPersonIdClaim = User.FindFirstValue("domainPersonId");
            if (domainPersonIdClaim == null)
                return Unauthorized("DomainPersonId not found in token.");

            if (!Guid.TryParse(domainPersonIdClaim, out var domainPersonId))
                return BadRequest("Invalid DomainPersonId in token.");

            var orders = await _orderService.GetUserOrdersAsync(domainPersonId, cancellationToken);

            await _logService.AddLogAsync(GetUser(), "Fetched orders for user with DomainPersonId");

            return Ok(orders);
        }


        // Get order details
        [HttpGet("{id:int}/details")]
        public async Task<IActionResult> GetOrderDetails(int id, CancellationToken cancellationToken)
        {
            var order = await _orderService.GetOrderDetailsAsync(id, cancellationToken);

            if (order == null)
                return NotFound(new { message = OrderMessages.OrderNotFound });

            await _logService.AddLogAsync(GetUser(), $"Fetched order details ID={id}");

            return Ok(order);
        }
    }
}
