using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;

namespace Rujta.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class StaffManagementController : ControllerBase
    {
        private readonly IStaffManagementService _service;

        public StaffManagementController(IStaffManagementService service)
        {
            _service = service;
        }

        [HttpGet("GetAllStaff")]
        public async Task<IActionResult> GetAllStaff()
        {
            var staffs = await _service.GetAllAsync();
            return Ok(staffs);
        }

        [HttpGet("GetStaffById/{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            var staff = await _service.GetByIdAsync(id);
            if (staff == null) return NotFound();
            return Ok(staff);
        }

        [HttpPost("AddStaff")]
        public async Task<IActionResult> AddStaff([FromBody] StaffDto staffDto)
        {
            await _service.AddAsync(staffDto);
            return Ok(staffDto);
        }

        [HttpPut("UpdateStaff/{id}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] StaffDto staffDto)
        {
            await _service.UpdateAsync(id, staffDto);
            return NoContent();
        }

        [HttpDelete("DeleteStaff/{id}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet("GetStaffByManager/{managerId}")]
        public async Task<IActionResult> GetStaffByManager(Guid managerId)
        {
            var staffs = await _service.GetStaffByManagerAsync(managerId);
            return Ok(staffs);
        }
    }
}
