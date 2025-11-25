using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using System;
using System.Threading.Tasks;

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

        // GET: api/StaffManagement/GetAllStaff
        [HttpGet("GetAllStaff")]
        public async Task<IActionResult> GetAllStaff()
        {
            var staffs = await _service.GetAllAsync();
            return Ok(staffs);
        }

        // GET: api/StaffManagement/GetStaffById/{id}
        [HttpGet("GetStaffById/{id:int}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            var staff = await _service.GetByIdAsync(id);
            if (staff == null) return NotFound();
            return Ok(staff);
        }

        // POST: api/StaffManagement/AddStaff
        [HttpPost("AddStaff")]
        public async Task<IActionResult> AddStaff([FromBody] StaffDto dto)
        {
            await _service.AddAsync(dto);
            return Ok(dto);
        }

        // PUT: api/StaffManagement/UpdateStaff/{id}
        [HttpPut("UpdateStaff/{id:int}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] StaffDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }

        // DELETE: api/StaffManagement/DeleteStaff/{id}
        [HttpDelete("DeleteStaff/{id:int}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }

        // GET: api/StaffManagement/GetStaffByManager/{managerId}
        [HttpGet("GetStaffByManager/{managerId}")]
        public async Task<IActionResult> GetStaffByManager(Guid managerId)
        {
            var staffs = await _service.GetStaffByManagerAsync(managerId);
            return Ok(staffs);
        }
    }
}
