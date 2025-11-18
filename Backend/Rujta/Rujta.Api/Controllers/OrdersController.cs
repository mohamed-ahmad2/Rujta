using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Claims;

namespace Rujta.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogService _logService;

        public OrdersController(IOrderService orderService, ILogService logService)
        {
            _orderService = orderService;
            _logService = logService;
        }

        private string GetUser() => User.Identity?.Name ?? "UnknownUser";

        // Create a new order
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrderDto orderDto, CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null) return Unauthorized("User not found in token.");

            if (!Guid.TryParse(userIdClaim, out var userId))
                return BadRequest("Invalid user ID in token.");

            orderDto.UserID = userId;

            var newOrder = await _orderService.CreateOrderAsync(orderDto, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Created order ID={newOrder.Id}");

            return CreatedAtAction(nameof(GetById), new { Id = newOrder.Id }, newOrder);
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
                return NotFound(new { message = "Order not found." });

            await _logService.AddLogAsync(GetUser(), $"Fetched order ID={id}");
            return Ok(order);
        }

        // Update an order
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderDto dto, CancellationToken cancellationToken)
        {
            var existingOrder = await _orderService.GetByIdAsync(id, cancellationToken);

            if (existingOrder == null)
                return NotFound(new { message = "Order not found." });

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
                return NotFound(new { message = "Order not found." });

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
            var userIdClaim = User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub);
            if (userIdClaim == null) return Unauthorized("User not found in token.");

            if (!Guid.TryParse(userIdClaim, out var userId))
                return BadRequest("Invalid user ID in token.");

            var orders = await _orderService.GetUserOrdersAsync(userId, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Fetched orders for user ID={userId}");

            return Ok(orders);
        }

        // Get order details
        [HttpGet("{id:int}/details")]
        public async Task<IActionResult> GetOrderDetails(int id, CancellationToken cancellationToken)
        {
            var order = await _orderService.GetOrderDetailsAsync(id, cancellationToken);

            if (order == null)
                return NotFound(new { message = "Order not found." });

            await _logService.AddLogAsync(GetUser(), $"Fetched order details ID={id}");

            return Ok(order);
        }
    }
}
