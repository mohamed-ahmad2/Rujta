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

        [HttpGet]
        public async Task<IActionResult> GetAllStaff()
        {
            var staffs = await _service.GetAllAsync();
            return Ok(staffs);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            var staff = await _service.GetByIdAsync(id);
            if (staff == null) return NotFound();
            return Ok(staff);
        }

        [HttpPost]
        public async Task<IActionResult> AddStaff([FromBody] StaffDto dto)
        {
            await _service.AddAsync(dto);
            return Ok(dto);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateStaff(int id, [FromBody] StaffDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
        [HttpGet("GetStaffByManager/{managerId}")]
        public async Task<IActionResult> GetStaffByManager(Guid managerId)
        {
            var staffs = await (_service as dynamic).GetStaffByManagerAsync(managerId);
            return Ok(staffs);
        }
    }
}
