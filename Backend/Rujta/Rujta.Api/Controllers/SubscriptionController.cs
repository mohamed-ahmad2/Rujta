using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.DTOs.SubscriptionDto;
using Rujta.Infrastructure.Identity;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)}")]
    [EnableRateLimiting("Fixed")]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        private bool TryGetPharmacyId(out int pharmacyId)
        {
            pharmacyId = 0;
            var claim = User.FindFirst("PharmacyId");
            if (claim == null) return false;
            return int.TryParse(claim.Value, out pharmacyId);
        }

        [HttpPost("create")]
        [Authorize(Roles = nameof(UserRole.PharmacyAdmin))]
        public async Task<IActionResult> Create([FromBody] CreateSubscriptionRequest request)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _subscriptionService.CreateSubscriptionAsync(
                pharmacyId,
                request.Plan
            );

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new
            {
                message = "Subscription created successfully.",
                subscriptionId = result.SubscriptionId,
                startDate = result.StartDate,
                endDate = result.EndDate
            });
        }

        [HttpGet("status/{pharmacyId:int?}")]
        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.SuperAdmin)}")]
        public async Task<IActionResult> GetStatus(int? pharmacyId)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            int realPharmacyId;

            if (userRole == nameof(UserRole.PharmacyAdmin))
            {
                if (!TryGetPharmacyId(out int claimPharmacyId))
                    return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

                realPharmacyId = claimPharmacyId;
            }
            else
            {
                if (!pharmacyId.HasValue)
                    return BadRequest(new { message = "pharmacyId is required for SuperAdmin." });

                realPharmacyId = pharmacyId.Value;
            }

            var result = await _subscriptionService.GetStatusAsync(realPharmacyId);

            if (!result.Found)
                return NotFound(new { message = "No subscription found for this pharmacy." });

            return Ok(new
            {
                status = result.Status?.ToString(),
                plan = result.Plan?.ToString(),
                startDate = result.StartDate,
                endDate = result.EndDate,
                daysRemaining = result.DaysRemaining
            });
        }

        [HttpPost("renew")]
        [Authorize(Roles = nameof(UserRole.PharmacyAdmin))]
        public async Task<IActionResult> Renew([FromBody] RenewSubscriptionRequest request)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _subscriptionService.RenewSubscriptionAsync(
                pharmacyId,
                request.Plan
            );

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new
            {
                message = "Subscription renewed successfully.",
                subscriptionId = result.SubscriptionId,
                startDate = result.StartDate,
                endDate = result.EndDate
            });
        }

        [HttpGet("all")]
        [Authorize(Roles = nameof(UserRole.SuperAdmin))]
        public async Task<IActionResult> GetAll()
        {
            var result = await _subscriptionService.GetAllSubscriptionsAsync();
            return Ok(result);
        }

        [HttpPatch("set-status")]
        [Authorize(Roles = nameof(UserRole.SuperAdmin))]
        public async Task<IActionResult> SetStatus([FromBody] SetStatusManuallyRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _subscriptionService.SetStatusManuallyAsync(
                request.PharmacyId,
                request.Activate
            );

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new
            {
                message = $"Subscription {(request.Activate ? "activated" : "deactivated")} successfully.",
                subscriptionId = result.SubscriptionId,
                startDate = result.StartDate,
                endDate = result.EndDate
            });
        }
    }
}