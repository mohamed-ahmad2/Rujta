/*
using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.DTOs.Payment;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Enums;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;
using System.Security.Claims;

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
        private readonly UserManager<ApplicationUser> _userManager;

        public PaymentsController(
            IPaymentService paymentService,
            ILogService logService,
            UserManager<ApplicationUser> userManager)
        {
            _paymentService = paymentService;
            _logService = logService;
            _userManager = userManager;
        }

        private string GetUser() => User.Identity?.Name ?? LogConstants.UnknownUser;

        /// <summary>
        /// Initiate a payment for an Order, Subscription, or Ad.
        /// Set Type = 1 (Order), 2 (Subscription), or 3 (Ad)
        /// and fill only the matching ID field.
        /// </summary>
        [Authorize(Roles = nameof(UserRole.PharmacyAdmin))]
        [HttpPost("initiate")]
        public async Task<IActionResult> Initiate(
            [FromBody] InitiatePaymentDto dto,
            CancellationToken cancellationToken)
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var appUser = await _userManager.FindByIdAsync(userId.ToString());
            if (appUser == null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            try
            {
                var result = await _paymentService.InitiateAsync(
                    userId, appUser.id, dto, cancellationToken);

                await _logService.AddLogAsync(GetUser(),
                    $"Initiated {dto.Type} payment — Ref: Order={dto.OrderId}, Sub={dto.SubscriptionId}, Ad={dto.AdId}");

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Paymob posts here after payment completes.
        /// Must be [AllowAnonymous] — Paymob has no auth token.
        /// </summary>
        [AllowAnonymous]
        [HttpPost("callback")]
        public async Task<IActionResult> Callback(
            [FromBody] PaymobCallbackDto dto,
            [FromQuery] string hmac,
            CancellationToken cancellationToken)
        {
            var success = await _paymentService.HandleCallbackAsync(dto, hmac, cancellationToken);

            if (!success)
                return BadRequest(new { message = "Invalid callback or HMAC mismatch." });

            return Ok(new { message = "Callback processed." });
        }

        [Authorize(Roles = nameof(UserRole.Pharmacist))]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyPayments(CancellationToken cancellationToken)
        {
            var appUser = await GetCurrentPharmacyUserAsync();
            if (appUser == null) return Unauthorized(ApiMessages.UnauthorizedAccess);

            var payments = await _paymentService.GetPharmacyPaymentsAsync(appUser.PharmacyId, cancellationToken);
            await _logService.AddLogAsync(GetUser(), "Fetched pharmacy payments");
            return Ok(payments);
        }

        [Authorize(Roles = nameof(UserRole.Pharmacist))]
        [HttpGet("my/orders")]
        public async Task<IActionResult> GetOrderPayments(CancellationToken cancellationToken)
            => await GetByType(PaymentType.Order, cancellationToken);

        [Authorize(Roles = nameof(UserRole.Pharmacist))]
        [HttpGet("my/subscriptions")]
        public async Task<IActionResult> GetSubscriptionPayments(CancellationToken cancellationToken)
            => await GetByType(PaymentType.Subscription, cancellationToken);

        [Authorize(Roles = nameof(UserRole.Pharmacy))]
        [HttpGet("my/ads")]
        public async Task<IActionResult> GetAdPayments(CancellationToken cancellationToken)
            => await GetByType(PaymentType.Ad, cancellationToken);

        [Authorize(Roles = nameof(UserRole.SuperAdmin))]
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] PaymentType? type,
            CancellationToken cancellationToken)
        {
            // extend your service/repo with GetAllAsync filtered by type if needed
            return Ok();
        }

        // ─── Helpers ────────────────────────────────────────────────────

        private async Task<IActionResult> GetByType(PaymentType type, CancellationToken cancellationToken)
        {
            var appUser = await GetCurrentPharmacyUserAsync();
            if (appUser == null) return Unauthorized(ApiMessages.UnauthorizedAccess);

            var payments = await _paymentService.GetPharmacyPaymentsByTypeAsync(
                appUser.PharmacyId, type, cancellationToken);

            await _logService.AddLogAsync(GetUser(), $"Fetched {type} payments");
            return Ok(payments);
        }

        private async Task<ApplicationUser?> GetCurrentPharmacyUserAsync()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId)) return null;
            return await _userManager.FindByIdAsync(userId.ToString());
        }
    }
}*/