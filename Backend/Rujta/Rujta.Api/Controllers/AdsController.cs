using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.DTOs.AdDto;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

namespace Rujta.API.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class AdsController : ControllerBase
    {
        private readonly IAdService _adService;
        private readonly ILogService _logService;

        public AdsController(IAdService adService, ILogService logService)
        {
            _adService = adService;
            _logService = logService;
        }
        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPost]
        [HttpPost]
        public async Task<ActionResult<AdDto>> Create([FromBody] AdDto dto)
        {
            if (dto is null)
                return BadRequest("Ad data cannot be null.");

         
            var pharmacyIdClaim = User.FindFirst("PharmacyId")?.Value;
            if (string.IsNullOrEmpty(pharmacyIdClaim) || !int.TryParse(pharmacyIdClaim, out var pharmacyId))
                return Unauthorized("PharmacyId claim is missing or invalid in token.");

            dto.PharmacyId = pharmacyId;

            try
            {
                var created = await _adService.CreateAsync(dto);
                await _logService.AddLogAsync(GetUser(), $"Created ad for pharmacy ID={dto.PharmacyId}: '{dto.Headline}'");
                return Ok(created);
            }
            catch (Exception ex)
            {
         
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }
        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdDto>>> GetAll(CancellationToken cancellationToken)
        {
            try
            {
                var ads = await _adService.GetAllActiveAsync(cancellationToken);
                return Ok(ads);
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Error fetching all ads: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }
        [AllowAnonymous]
        [HttpGet("pharmacy/{pharmacyId:int}")]
        public async Task<ActionResult<IEnumerable<AdDto>>> GetByPharmacy(
            int pharmacyId,
            CancellationToken cancellationToken)
        {
            try
            {
                var ads = await _adService.GetByPharmacyIdAsync(pharmacyId, cancellationToken);
                return Ok(ads);
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Error fetching ads for pharmacy ID={pharmacyId}: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }
        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Deactivate(int id)
        {
            try
            {
                await _adService.DeactivateAsync(id);
                await _logService.AddLogAsync(GetUser(), $"Deactivated ad ID={id}");
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Ad with ID={id} not found.");
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Error deactivating ad ID={id}: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }
        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPatch("{id:int}/status")]
        public async Task<ActionResult> SetStatus(int id, [FromBody] AdStatusDto dto)
        {
            if (dto is null)
                return BadRequest("Status data cannot be null.");

            try
            {
                await _adService.SetStatusAsync(id, dto.IsActive);
                await _logService.AddLogAsync(GetUser(), $"Set ad ID={id} IsActive={dto.IsActive}");
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Ad with ID={id} not found.");
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Error updating status for ad ID={id}: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }
        private string GetUser() =>
            User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Name)
            ?? User.Identity?.Name
            ?? AuthMessages.UnknownUser;
    }
}
