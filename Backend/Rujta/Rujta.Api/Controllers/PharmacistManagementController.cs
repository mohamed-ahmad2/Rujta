using Microsoft.AspNetCore.RateLimiting;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

namespace Rujta.API.Controllers
{
    [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)}")]
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class PharmacistManagementController : ControllerBase
    {
        private readonly IPharmacistManagementService _service;

        public PharmacistManagementController(IPharmacistManagementService service)
        {
            _service = service;
        }

        [HttpGet("GetAllPharmacist")]
        public async Task<IActionResult> GetAllPharmacist()
        {
            var pharmacistS = await _service.GetAllAsync();
            return Ok(pharmacistS);
        }

        [HttpGet("GetPharmacistById/{id:int}")]
        public async Task<IActionResult> GetPharmacistById(int id)
        {
            var pharmacist = await _service.GetByIdAsync(id);
            if (pharmacist == null) return NotFound();
            return Ok(pharmacist);
        }

        [HttpPost("AddStaff")]
        public async Task<IActionResult> AddPharmacist([FromBody] PharmacistDto dto)
        {
            await _service.AddAsync(dto);
            return Ok(dto);
        }

        [HttpPut("UpdateStaff/{id:int}")]
        public async Task<IActionResult> UpdatePharmacist(int id, [FromBody] PharmacistDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("DeleteStaff/{id:int}")]
        public async Task<IActionResult> DeletePharmacist(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet("GetPharmacistByManager/{managerId}")]
        public async Task<IActionResult> GetPharmacistByManager(Guid managerId)
        {
            var pharmacists = await _service.GetPharmacistByManagerAsync(managerId);
            return Ok(pharmacists);
        }

        [HttpGet("staff")]
        public async Task<IActionResult> GetPharmacyStaff()
        {
            var pharmacyIdClaim = User.FindFirst("PharmacyId");
            if (pharmacyIdClaim == null)
                return Unauthorized("Pharmacy context missing.");

            int pharmacyId = int.Parse(pharmacyIdClaim.Value);

            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized(ApiMessages.UnauthorizedAccess);

            var staff = await _service.GetByPharmacyIdAsync(pharmacyId);

            return Ok(staff);
        }
    }
}
