using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.Constants;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;
using Rujta.Domain.Enums;
using Rujta.Application.DTOs.OrderDto;

namespace Rujta.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ILogService _logService;
        private readonly IOrderNotificationService _orderNotificationService;

        public OrdersController(
            IOrderService orderService,
            ILogService logService,
            IOrderNotificationService orderNotificationService)
        {
            _orderService = orderService;
            _logService = logService;
            _orderNotificationService = orderNotificationService;
        }

        private string GetUser() => User.Identity?.Name ?? LogConstants.UnknownUser;

        private int GetCurrentPharmacyId()
        {
            var claim = User.FindFirstValue("PharmacyId");
            if (string.IsNullOrWhiteSpace(claim) || !int.TryParse(claim, out var pharmacyId))
                throw new UnauthorizedAccessException("Invalid PharmacyId claim.");
            return pharmacyId;
        }

        private string GetDomainPersonId() => User.FindFirstValue("domainPersonId") ?? string.Empty;


        [Authorize(Roles = $"{nameof(UserRole.User)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] List<CreateOrderDto> orders)
        {
            try
            {
                var userIdClaim = GetDomainPersonId();
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized(ApiMessages.UnauthorizedAccess);

                var userGuid = Guid.Parse(userIdClaim);
                var results = new List<OrderDto>();

                foreach (var dto in orders)
                {
                    var order = await _orderService.CreateOrderAsync(dto, userGuid);
                    results.Add(order);
                    await _logService.AddLogAsync(GetUser(), $"Order {order.Id} created successfully for UserId {userIdClaim}");
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Error creating order: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }


        [Authorize(Roles = nameof(UserRole.SuperAdmin))]
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var orders = await _orderService.GetAllAsync(cancellationToken);
            await _logService.AddLogAsync(GetUser(), "Fetched all orders");
            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var order = await _orderService.GetByIdAsync(id, cancellationToken);
            if (order == null) return NotFound(new { message = OrderMessages.OrderNotFound });
            await _logService.AddLogAsync(GetUser(), $"Fetched order ID={id}");
            return Ok(order);
        }

        [HttpGet("{id:int}/details")]
        public async Task<IActionResult> GetOrderDetails(int id, CancellationToken cancellationToken)
        {
            var order = await _orderService.GetOrderDetailsAsync(id, cancellationToken);
            if (order == null) return NotFound(new { message = OrderMessages.OrderNotFound });
            await _logService.AddLogAsync(GetUser(), $"Fetched order details ID={id}");
            return Ok(order);
        }

        [Authorize(Roles = nameof(UserRole.User))]
        [HttpGet("user")]
        public async Task<IActionResult> GetUserOrders(CancellationToken cancellationToken)
        {
            var domainPersonIdClaim = GetDomainPersonId();
            if (string.IsNullOrEmpty(domainPersonIdClaim)) return Unauthorized("DomainPersonId not found");

            var groupedOrders = await _orderService.GetUserOrdersGroupedAsync(Guid.Parse(domainPersonIdClaim), cancellationToken);
            await _logService.AddLogAsync(GetUser(), "Fetched orders for user");
            return Ok(groupedOrders);
        }

        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpGet("pharmacy/orders")]
        public async Task<IActionResult> GetPharmacyOrders(CancellationToken cancellationToken)
        {
            var pharmacyId = GetCurrentPharmacyId();
            var orders = await _orderService.GetPharmacyOrdersAsync(pharmacyId, cancellationToken);
            return Ok(orders);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] OrderDto dto, CancellationToken cancellationToken)
        {
            var existingOrder = await _orderService.GetByIdAsync(id, cancellationToken);
            if (existingOrder == null) return NotFound(new { message = OrderMessages.OrderNotFound });

            await _orderService.UpdateAsync(id, dto, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Updated order ID={id}");
            await _orderNotificationService.NotifyOrderUpdatedAsync(existingOrder.PharmacyID, id);

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var existingOrder = await _orderService.GetByIdAsync(id, cancellationToken);
            if (existingOrder == null) return NotFound(new { message = OrderMessages.OrderNotFound });

            await _orderService.DeleteAsync(id, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Deleted order ID={id}");
            await _orderNotificationService.NotifyOrderItemChangedAsync(id);

            return NoContent();
        }

        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPut("{id:int}/accept")]
        public async Task<IActionResult> Accept(int id, CancellationToken cancellationToken)
        {
            var pharmacyId = GetCurrentPharmacyId();
            var result = await _orderService.AcceptOrderAsync(id, pharmacyId, cancellationToken);

            if (result.success)
            {
                await _logService.AddLogAsync(GetUser(), $"Accepted order ID={id}");
                var userId = GetDomainPersonId();
                await _orderNotificationService.NotifyStatusChangedAsync(pharmacyId, userId, id, OrderStatus.Accepted);
            }

            return result.success ? Ok(result) : BadRequest(result);
        }

        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPut("{id:int}/process")]
        public async Task<IActionResult> Process(int id, CancellationToken cancellationToken)
        {
            var pharmacyId = GetCurrentPharmacyId();
            var result = await _orderService.ProcessOrderAsync(id, pharmacyId, cancellationToken);

            if (result.success)
            {
                await _logService.AddLogAsync(GetUser(), $"Processed order ID={id}");
                var userId = GetDomainPersonId();
                await _orderNotificationService.NotifyStatusChangedAsync(pharmacyId, userId, id, OrderStatus.Processing);
            }

            return result.success ? Ok(result) : BadRequest(result);
        }

        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPut("{id:int}/out-for-delivery")]
        public async Task<IActionResult> OutForDelivery(int id, CancellationToken cancellationToken)
        {
            var pharmacyId = GetCurrentPharmacyId();
            var result = await _orderService.OutForDeliveryAsync(id, pharmacyId, cancellationToken);

            if (result.success)
            {
                await _logService.AddLogAsync(GetUser(), $"Order ID={id} out for delivery");
                var userId = GetDomainPersonId();
                await _orderNotificationService.NotifyStatusChangedAsync(pharmacyId, userId, id, OrderStatus.OutForDelivery);
            }

            return result.success ? Ok(result) : BadRequest(result);
        }

        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPut("{id:int}/delivered")]
        public async Task<IActionResult> MarkAsDelivered(int id, CancellationToken cancellationToken)
        {
            var pharmacyId = GetCurrentPharmacyId();
            var result = await _orderService.MarkAsDeliveredAsync(id, pharmacyId, cancellationToken);

            if (result.success)
            {
                await _logService.AddLogAsync(GetUser(), $"Order ID={id} marked as delivered");
                var userId = GetDomainPersonId();
                await _orderNotificationService.NotifyStatusChangedAsync(pharmacyId, userId, id, OrderStatus.Delivered);
            }

            return result.success ? Ok(result) : BadRequest(result);
        }

        [Authorize(Roles = nameof(UserRole.User))]
        [HttpPut("{id:int}/cancel/user")]
        public async Task<IActionResult> CancelByUser(int id, CancellationToken cancellationToken)
        {

            var result = await _orderService.CancelOrderByUserAsync(id, cancellationToken);

            if (result.success)
                await _logService.AddLogAsync(GetUser(), $"User cancelled order ID={id}");
            

            return result.success ? Ok(result) : BadRequest(result);
        }

        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPut("{id:int}/cancel/pharmacy")]
        public async Task<IActionResult> CancelByPharmacy(int id, CancellationToken cancellationToken)
        {
            var pharmacyId = GetCurrentPharmacyId();
            var result = await _orderService.CancelOrderByPharmacyAsync(id, pharmacyId, cancellationToken);

            if (result.success)
            {
                await _logService.AddLogAsync(GetUser(), $"Pharmacy cancelled order ID={id}");
                var userId = GetDomainPersonId();
                await _orderNotificationService.NotifyStatusChangedAsync(pharmacyId, userId, id, OrderStatus.CancelledByPharmacy);
            }

            return result.success ? Ok(result) : BadRequest(result);
        }
    }
}