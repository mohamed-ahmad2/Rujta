using Microsoft.AspNetCore.RateLimiting;
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

        // GET: api/PharmacistManagement/GetAllPharmacist
        [HttpGet("GetAllPharmacist")]
        public async Task<IActionResult> GetAllPharmacist()
        {
            var pharmacistS = await _service.GetAllAsync();
            return Ok(pharmacistS);
        }

        // GET: api/PharmacistManagement/GetPharmacistById/{id}
        [HttpGet("GetPharmacistById/{id:int}")]
        public async Task<IActionResult> GetPharmacistById(int id)
        {
            var pharmacist = await _service.GetByIdAsync(id);
            if (pharmacist == null) return NotFound();
            return Ok(pharmacist);
        }

        // POST: api/PharmacistManagement/AddStaff
        [HttpPost("AddStaff")]
        public async Task<IActionResult> AddPharmacist([FromBody] PharmacistDto dto)
        {
            await _service.AddAsync(dto);
            return Ok(dto);
        }

        // PUT: api/PharmacistManagement/UpdatePharmacist/{id}
        [HttpPut("UpdateStaff/{id:int}")]
        public async Task<IActionResult> UpdatePharmacist(int id, [FromBody] PharmacistDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }

        // DELETE: api/PharmacistManagement/DeleteStaff/{id}
        [HttpDelete("DeleteStaff/{id:int}")]
        public async Task<IActionResult> DeletePharmacist(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        // GET: api/PharmacistManagement/GetPharmacistByManager/{managerId}
        [HttpGet("GetPharmacistByManager/{managerId}")]
        public async Task<IActionResult> GetPharmacistByManager(Guid managerId)
        {
            var pharmacists = await _service.GetPharmacistByManagerAsync(managerId);
            return Ok(pharmacists);
        }
    }
}
