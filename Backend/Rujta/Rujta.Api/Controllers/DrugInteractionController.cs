// ─────────────────────────────────────────────────────────────────────────────
// FILE: Rujta.Api/Controllers/DrugInteractionController.cs
// ─────────────────────────────────────────────────────────────────────────────

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;

namespace Rujta.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]   // remove if you want it public
public class DrugInteractionController : ControllerBase
{
    private readonly IDrugInteractionService _drugInteractionService;

    public DrugInteractionController(IDrugInteractionService drugInteractionService)
    {
        _drugInteractionService = drugInteractionService;
    }


    [HttpPost("check")]
    [ProducesResponseType(typeof(OrderDrugInteractionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CheckInteractions(
        [FromBody] CheckInteractionsRequest request,
        CancellationToken ct)
    {
        if (request.MedicineIds is null || !request.MedicineIds.Any())
            return BadRequest("At least one medicine ID is required.");

        var result = await _drugInteractionService.CheckOrderInteractionsAsync(
            request.MedicineIds,
            request.PatientUserId,
            request.Threshold,
            ct
        );

        return Ok(result);
    }


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

// ── Request DTO ───────────────────────────────────────────────────────────────
public class CheckInteractionsRequest
{
    public List<int> MedicineIds { get; set; } = new();

    public Guid PatientUserId { get; set; }

    public double Threshold { get; set; } = 0.5;
}