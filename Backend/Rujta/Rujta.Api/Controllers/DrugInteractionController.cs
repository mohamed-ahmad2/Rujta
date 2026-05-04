// ─────────────────────────────────────────────────────────────────────────────
// FILE: Rujta.Api/Controllers/DrugInteractionController.cs
// ─────────────────────────────────────────────────────────────────────────────

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;

namespace Rujta.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DrugInteractionController : ControllerBase
{
    private readonly IDrugInteractionService _drugInteractionService;

    public DrugInteractionController(IDrugInteractionService drugInteractionService)
    {
        _drugInteractionService = drugInteractionService;
    }

    /// <summary>
    /// Check drug interactions for a list of medicine IDs.
    /// User ID is extracted automatically from the JWT token — no need to pass it.
    ///
    /// POST /api/druginteraction/check
    /// Headers: Authorization: Bearer YOUR_TOKEN
    /// Body: { "medicineIds": [1, 2, 3], "threshold": 0.5 }
    /// </summary>
    [HttpPost("check")]
    [ProducesResponseType(typeof(OrderDrugInteractionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CheckInteractions(
        [FromBody] CheckInteractionsRequest request,
        CancellationToken ct)
    {
        // ── Extract user ID from JWT token ────────────────────────────────────
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub")
                       ?? User.FindFirst("uid");

        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized("Could not extract user ID from token.");

        // ── Validate request ──────────────────────────────────────────────────
        if (request.MedicineIds is null || !request.MedicineIds.Any())
            return BadRequest("At least one medicine ID is required.");

        // ── Run interaction check ─────────────────────────────────────────────
        var result = await _drugInteractionService.CheckOrderInteractionsAsync(
            request.MedicineIds,
            userId,           // ← from token, not from request body
            request.Threshold,
            ct
        );

        return Ok(result);
    }

    /// <summary>
    /// Health check — is the Python ML service reachable?
    /// GET /api/druginteraction/health
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<IActionResult> Health(CancellationToken ct)
    {
        var healthy = await _drugInteractionService.IsMlServiceHealthyAsync(ct);
        return healthy
            ? Ok(new { status = "ok", mlService = "reachable" })
            : StatusCode(503, new { status = "degraded", mlService = "unreachable" });
    }
}

// ── Request DTO — no PatientUserId needed anymore ─────────────────────────────
public class CheckInteractionsRequest
{
    /// <summary>Medicine IDs from the current order cart</summary>
    public List<int> MedicineIds { get; set; } = new();

    /// <summary>Interaction probability threshold (default 0.5)</summary>
    public double Threshold { get; set; } = 0.5;
}