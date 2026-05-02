using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.DTOs; 
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;
using System.Security.Claims;

namespace Rujta.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class DrugRequestController : ControllerBase
    {
        private readonly IDrugRequestService _service;
        private readonly ILogService _logService;

        private const string MissingPharmacyIdMessage = "PharmacyId claim missing in JWT.";

        public DrugRequestController(IDrugRequestService service, ILogService logService)
        {
            _service = service;
            _logService = logService;
        }

        // ── Helpers (same pattern as InventoryItemController) ────
        private string GetCurrentUser()
            => User.Identity?.Name
               ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? AuthMessages.UnknownUser;

        private bool TryGetPharmacyId(out int pharmacyId)
        {
            pharmacyId = 0;
            var claim = User.FindFirst("PharmacyId");
            if (claim == null) return false;
            return int.TryParse(claim.Value, out pharmacyId);
        }

        private string GetUserId()
            => User.FindFirst("domainPersonId")?.Value
               ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? string.Empty;


        // ════════════════════════════════════════════════════════
        // PHARMACY ADMIN ENDPOINTS
        // ════════════════════════════════════════════════════════

        /// <summary>
        /// PharmacyAdmin submits a new drug request to SuperAdmin.
        /// POST /api/DrugRequest
        /// </summary>
        [HttpPost]
        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        public async Task<ActionResult<DrugRequestDto>> Submit([FromBody] CreateDrugRequestDto dto)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = MissingPharmacyIdMessage });

            var result = await _service.SubmitAsync(dto, pharmacyId, GetUserId());

            await _logService.AddLogAsync(
                GetCurrentUser(),
                $"Submitted drug request for '{dto.DrugName}' (Pharmacy {pharmacyId})");

            return CreatedAtAction(nameof(GetMyRequests), new { }, result);
        }

        /// <summary>
        /// PharmacyAdmin views their own pharmacy's drug requests.
        /// GET /api/DrugRequest/my
        /// </summary>
        [HttpGet("my")]
        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        public async Task<ActionResult<IEnumerable<DrugRequestDto>>> GetMyRequests()
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = MissingPharmacyIdMessage });

            var results = await _service.GetMyRequestsAsync(pharmacyId);
            return Ok(results);
        }


        // ════════════════════════════════════════════════════════
        // SUPER ADMIN ENDPOINTS
        // ════════════════════════════════════════════════════════

        /// <summary>
        /// SuperAdmin lists all drug requests — optionally filtered by status or pharmacy.
        /// GET /api/DrugRequest?status=Pending&pharmacyId=3
        /// </summary>
        [HttpGet]
        [Authorize(Roles = nameof(UserRole.SuperAdmin))]
        public async Task<ActionResult<IEnumerable<DrugRequestDto>>> GetAll(
            [FromQuery] string? status = null,
            [FromQuery] int? pharmacyId = null)
        {
            DrugRequestStatus? parsedStatus = null;
            if (!string.IsNullOrWhiteSpace(status) &&
                Enum.TryParse<DrugRequestStatus>(status, ignoreCase: true, out var s))
            {
                parsedStatus = s;
            }

            var results = await _service.GetAllAsync(parsedStatus, pharmacyId);
            return Ok(results);
        }

        /// <summary>
        /// SuperAdmin approves or rejects a drug request.
        /// PUT /api/DrugRequest/{id}/review
        /// Body: { "approved": true }  |  { "approved": false, "rejectionReason": "..." }
        /// </summary>
        [HttpPut("{id:int}/review")]
        [Authorize(Roles = nameof(UserRole.SuperAdmin))]
        public async Task<ActionResult<DrugRequestDto>> Review(int id, [FromBody] ReviewDrugRequestDto dto)
        {
            try
            {
                var result = await _service.ReviewAsync(id, dto, GetUserId());

                await _logService.AddLogAsync(
                    GetCurrentUser(),
                    $"DrugRequest {id} {(dto.Approved ? "APPROVED" : $"REJECTED — {dto.RejectionReason}")}");

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
