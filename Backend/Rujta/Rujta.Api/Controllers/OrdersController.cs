using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;


namespace Rujta.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderDto orderDto, CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null) return Unauthorized("User not found in token.");

            if (!Guid.TryParse(userIdClaim, out var userId))
                    return BadRequest("Invalid user ID in token.");

            orderDto.UserID = userId;
            var newOrder = await _orderService.CreateOrderAsync(orderDto, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { Id = newOrder.Id }, newOrder);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var orders = await _orderService.GetAllAsync(cancellationToken);
            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var orderByI = await _orderService.GetByIdAsync(id, cancellationToken);
            if (orderByI == null)
                return NotFound(new { message = "Order not found." });
            return Ok(orderByI);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update( int id, [FromBody] OrderDto dto, CancellationToken cancellationToken)
        {
            await _orderService.UpdateAsync(id, dto, cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _orderService.DeleteAsync(id, cancellationToken);
            return NoContent();
        }

        [HttpPut("{id:int}/accept")]
        public async Task<IActionResult> Accept(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.AcceptOrderAsync(id, cancellationToken);
            return result.success ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{id:int}/process")]
        public async Task<IActionResult> Process(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.ProcessOrderAsync(id, cancellationToken);
            return result.success ? Ok(result) : BadRequest(result);
        }

        
        [HttpPut("{id:int}/out-for-delivery")]
        public async Task<IActionResult> OutForDelivery(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.OutForDeliveryAsync(id, cancellationToken);
            return result.success ? Ok(result) : BadRequest(result);
        }

        
        [HttpPut("{id:int}/delivered")]
        public async Task<IActionResult> MarkAsDelivered(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.MarkAsDeliveredAsync(id, cancellationToken);
            return result.success ? Ok(result) : BadRequest(result);
        }

       
        [HttpPut("{id:int}/cancel/user")]
        public async Task<IActionResult> CancelByUser(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.CancelOrderByUserAsync(id, cancellationToken);
            return result.success ? Ok(result) : BadRequest(result);
        }

        
        [HttpPut("{id:int}/cancel/pharmacy")]
        public async Task<IActionResult> CancelByPharmacy(int id, CancellationToken cancellationToken)
        {
            var result = await _orderService.CancelOrderByPharmacyAsync(id, cancellationToken);
            return result.success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("user/{userId:guid}")]
        public async Task<IActionResult> GetUserOrders(CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null) return Unauthorized("User not found in token.");

            if (!Guid.TryParse(userIdClaim, out var userId))
                return BadRequest("Invalid user ID in token.");

            var orders = await _orderService.GetUserOrdersAsync(userId, cancellationToken);
            return Ok(orders);
        }

        
        [HttpGet("{id:int}/details")]
        public async Task<IActionResult> GetOrderDetails(int id, CancellationToken cancellationToken)
        {
            var order = await _orderService.GetOrderDetailsAsync(id, cancellationToken);
            if (order == null)
                return NotFound(new { message = "Order not found." });

            return Ok(order);
        }

    }
}
