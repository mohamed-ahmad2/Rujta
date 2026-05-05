using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.Interfaces;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/admin/subscription")]
    [Authorize(Roles = "SuperAdmin")]
    public class AdminSubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;

        public AdminSubscriptionController(ISubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        // ── GET api/admin/subscription/all ────────────────────────────────────
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _subscriptionService.GetAllSubscriptionsAsync();
            return Ok(result);
        }

        // ── PATCH api/admin/subscription/activate/5 ───────────────────────────
        [HttpPatch("activate/{pharmacyId:int}")]
        public async Task<IActionResult> Activate(int pharmacyId)
        {
            var result = await _subscriptionService.SetStatusManuallyAsync(pharmacyId, activate: true);

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = "Subscription activated successfully." });
        }

        // ── PATCH api/admin/subscription/deactivate/5 ─────────────────────────
        [HttpPatch("deactivate/{pharmacyId:int}")]
        public async Task<IActionResult> Deactivate(int pharmacyId)
        {
            var result = await _subscriptionService.SetStatusManuallyAsync(pharmacyId, activate: false);

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = "Subscription deactivated successfully." });
        }
    }
}