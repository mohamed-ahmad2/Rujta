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
public class DrugInteractionController : ControllerBase
{
    private readonly IDrugInteractionService _drugInteractionService;

    public DrugInteractionController(IDrugInteractionService drugInteractionService)
    {
        _drugInteractionService = drugInteractionService;
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

    /// <summary>
    /// PAGE 1 — Check interactions within the new order drugs only (no history).
    /// POST /api/druginteraction/check-order
    /// Body: { "medicineIds": [1, 2, 3], "threshold": 0.5 }
    /// </summary>
    [HttpPost("check-order")]
    [ProducesResponseType(typeof(OrderDrugInteractionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CheckOrderOnly(
        [FromBody] CheckInteractionsRequest request,
        CancellationToken ct)
    {
        if (request.MedicineIds is null || !request.MedicineIds.Any())
            return BadRequest("At least one medicine ID is required.");

        var result = await _drugInteractionService.CheckNewOrderOnlyAsync(
            request.MedicineIds,
            request.Threshold,
            ct
        );
        return Ok(result);
    }

    /// <summary>
    /// PAGE 2 — Check new order drugs against the user's past history.
    /// POST /api/druginteraction/check-history
    /// Headers: Authorization: Bearer YOUR_TOKEN
    /// Body: { "medicineIds": [1, 2, 3], "threshold": 0.5 }
    /// </summary>
    [HttpPost("check-history")]
    [ProducesResponseType(typeof(OrderDrugInteractionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CheckWithHistory(
        [FromBody] CheckInteractionsRequest request,
        CancellationToken ct)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
                       ?? User.FindFirst("sub")
                       ?? User.FindFirst("uid");

        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out var userId))
            return Unauthorized("Could not extract user ID from token.");

        if (request.MedicineIds is null || !request.MedicineIds.Any())
            return BadRequest("At least one medicine ID is required.");

        var result = await _drugInteractionService.CheckOrderInteractionsAsync(
            request.MedicineIds,
            userId,
            request.Threshold,
            ct
        );
        return Ok(result);
    }
}

// ── Request DTO ───────────────────────────────────────────────────────────────
public class CheckInteractionsRequest
{
    /// <summary>Medicine IDs from the current order cart</summary>
    public List<int> MedicineIds { get; set; } = new();

    /// <summary>Interaction probability threshold (default 0.5)</summary>
    public double Threshold { get; set; } = 0.5;
}