using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "PharmacyAdmin")]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public SubscriptionController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        // ── POST api/subscription/create ──────────────────────────────────────
        // Called right after first-time registration to choose a plan
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateSubscriptionRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _subscriptionService.CreateSubscriptionAsync(
                request.PharmacyId,
                request.Plan
            );

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new
            {
                message = "Subscription created successfully.",
                startDate = result.StartDate,
                endDate = result.EndDate
            });
        }

        // ── GET api/subscription/status/{pharmacyId} ──────────────────────────
        // Check current subscription status
        [HttpGet("status/{pharmacyId:int}")]
        public async Task<IActionResult> GetStatus(int pharmacyId)
        {
            var result = await _subscriptionService.GetStatusAsync(pharmacyId);

            if (!result.Found)
                return NotFound(new { message = "No subscription found for this pharmacy." });

            return Ok(new
            {
                status = result.Status.ToString(),
                plan = result.Plan.ToString(),
                startDate = result.StartDate,
                endDate = result.EndDate,
                daysRemaining = result.DaysRemaining
            });
        }

        // ── POST api/subscription/renew ───────────────────────────────────────
        // Renew an expired (or active) subscription
        // This endpoint must be accessible even when subscription is expired,
        // so we allow it through middleware — covered in Step 5
        [HttpPost("renew")]
        public async Task<IActionResult> Renew([FromBody] RenewSubscriptionRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _subscriptionService.RenewSubscriptionAsync(
                request.PharmacyId,
                request.Plan
            );

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new
            {
                message = "Subscription renewed successfully.",
                startDate = result.StartDate,
                endDate = result.EndDate
            });
        }
    }
}