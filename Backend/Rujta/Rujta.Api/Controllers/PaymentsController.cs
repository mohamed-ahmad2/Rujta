using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Rujta.Application.DTOs.PaymentDto;
using Rujta.Domain.Entities;
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

     
        private async Task<(ApplicationUser appUser, int pharmacyId)?> ResolvePharmacyUserAsync()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdClaim, out var userId)) return null;

            // Must Include(DomainPerson) — FindByIdAsync does NOT load navigation properties
            var appUser = await _userManager.Users
                .Include(u => u.DomainPerson)
                .FirstOrDefaultAsync(u => u.Id == userId);

            // DomainPerson is stored as Person but the actual row is an Employee (TPH/TPT)
            if (appUser?.DomainPerson is not Employee employee) return null;

            // PharmacyId is int? on Employee — reject if unassigned
            if (employee.PharmacyId is not int pharmacyId) return null;

            return (appUser, pharmacyId);
        }

       
        [Authorize(Roles = nameof(UserRole.PharmacyAdmin))]
        [HttpPost("initiate")]
        public async Task<IActionResult> Initiate(
            [FromBody] InitiatePaymentDto dto,
            CancellationToken cancellationToken)
        {
            var resolved = await ResolvePharmacyUserAsync();
            if (resolved == null) return Unauthorized(ApiMessages.UnauthorizedAccess);

            var (appUser, pharmacyId) = resolved.Value;

            try
            {
                var result = await _paymentService.InitiateAsync(
                    appUser.Id, pharmacyId, dto, cancellationToken);

                await _logService.AddLogAsync(GetUser(),
                    $"Initiated {dto.Type} payment — Ref: Order={dto.OrderId}, Sub={dto.SubscriptionId}, Ad={dto.AdId}");

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
 
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
            var resolved = await ResolvePharmacyUserAsync();
            if (resolved == null) return Unauthorized(ApiMessages.UnauthorizedAccess);

            var payments = await _paymentService.GetPharmacyPaymentsAsync(
                resolved.Value.pharmacyId, cancellationToken);

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

        [Authorize(Roles = nameof(UserRole.PharmacyAdmin))]
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
            var resolved = await ResolvePharmacyUserAsync();
            if (resolved == null) return Unauthorized(ApiMessages.UnauthorizedAccess);

            var payments = await _paymentService.GetPharmacyPaymentsByTypeAsync(
                resolved.Value.pharmacyId, type, cancellationToken);

            await _logService.AddLogAsync(GetUser(), $"Fetched {type} payments");
            return Ok(payments);
        }
    }
}
