using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.DTOs.OrderDto;
using Rujta.Application.DTOs.PaymentDto;
using Rujta.Domain.Enums;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

namespace Rujta.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogService _logService;

        public PaymentsController(
            IPaymentService paymentService,
            ILogService logService)
        {
            _paymentService = paymentService;
            _logService = logService;
        }

        private string GetUser() => User.Identity?.Name ?? LogConstants.UnknownUser;

        private bool TryGetPharmacyId(out int pharmacyId)
        {
            pharmacyId = 0;
            var claim = User.FindFirst("PharmacyId");
            return claim != null && int.TryParse(claim.Value, out pharmacyId);
        }

        private bool TryGetUserId(out Guid userId)
        {
            userId = Guid.Empty;
            var claim = User.FindFirst("domainPersonId");
            return claim != null && Guid.TryParse(claim.Value, out userId);
        }

        [Authorize(Roles = $"{nameof(UserRole.User)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPost("initiate")]
        public async Task<IActionResult> Initiate([FromBody] InitiatePaymentDto dto, CancellationToken cancellationToken)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            int pharmacyId = 0;
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role != nameof(UserRole.User) && !TryGetPharmacyId(out pharmacyId))
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            if (dto.Type == PaymentType.Order && string.IsNullOrWhiteSpace(dto.PendingOrderDtoJson))
                return BadRequest(new
                {
                    message = "PendingOrderDtoJson is required for Order payment. " +
                              "Serialize your CreateOrderDto and pass it in this field."
                });

            if (dto.Type == PaymentType.Order)
            {
                try
                {
                    var pendingOrder = System.Text.Json.JsonSerializer
                        .Deserialize<CreateOrderDto>(dto.PendingOrderDtoJson!);

                    if (pendingOrder?.PaymentMethod != PaymentMethod.Payment)
                        return BadRequest(new
                        {
                            message = "The order inside PendingOrderDtoJson must have PaymentMethod = Payment."
                        });
                }
                catch
                {
                    return BadRequest(new { message = "PendingOrderDtoJson is not valid JSON." });
                }
            }

            try
            {
                var result = await _paymentService.InitiateAsync(
                    userId, pharmacyId, dto, cancellationToken);

                await _logService.AddLogAsync(
                    GetUser(),
                    $"Initiated {dto.Type} payment (Sub={dto.SubscriptionId}, Ad={dto.AdId})");

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Payment initiation error: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("callback")]
        public async Task<IActionResult> Callback([FromBody] PaymobCallbackDto dto, [FromQuery] string hmac, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(hmac))
                return BadRequest(new { message = "HMAC signature is missing." });

            var success = await _paymentService.HandleCallbackAsync(dto, hmac, cancellationToken);

            if (!success)
                return BadRequest(new { message = "Invalid callback or HMAC mismatch." });

            return Ok(new { message = "Callback processed." });
        }

        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyPayments(CancellationToken cancellationToken)
        {
            if (!TryGetPharmacyId(out var pharmacyId))
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var payments = await _paymentService.GetPharmacyPaymentsAsync(pharmacyId, cancellationToken);
            await _logService.AddLogAsync(GetUser(), "Fetched pharmacy payments");
            return Ok(payments);
        }

        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpGet("my/orders")]
        public Task<IActionResult> GetOrderPayments(CancellationToken cancellationToken)
            => GetByType(PaymentType.Order, cancellationToken);

        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpGet("my/subscriptions")]
        public Task<IActionResult> GetSubscriptionPayments(CancellationToken cancellationToken)
            => GetByType(PaymentType.Subscription, cancellationToken);

        [Authorize(Roles = nameof(UserRole.PharmacyAdmin))]
        [HttpGet("my/ads")]
        public Task<IActionResult> GetAdPayments(CancellationToken cancellationToken)
            => GetByType(PaymentType.Ad, cancellationToken);

        private async Task<IActionResult> GetByType(PaymentType type, CancellationToken cancellationToken)
        {
            if (!TryGetPharmacyId(out var pharmacyId))
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var payments = await _paymentService.GetPharmacyPaymentsByTypeAsync(
                pharmacyId, type, cancellationToken);

            await _logService.AddLogAsync(GetUser(), $"Fetched {type} payments");
            return Ok(payments);
        }
    }
}