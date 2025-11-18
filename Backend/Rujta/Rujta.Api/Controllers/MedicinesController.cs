using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;

namespace Rujta.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MedicinesController : ControllerBase
    {
        private readonly IMedicineService _medicineService;
        private readonly ILogService _logService;


        public MedicinesController(IMedicineService medicineService, ILogService logService)
        {
            _medicineService = medicineService;
            _logService = logService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> GetAll()
        {
            return Ok(await _medicineService.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MedicineDto>> GetById(int id)
        {
            var medicine = await _medicineService.GetByIdAsync(id);
            if (medicine == null) return NotFound();
            return Ok(medicine);
        }

        [HttpPost]
        public async Task<ActionResult> Add([FromBody] MedicineDto dto)
        {
            await _medicineService.AddAsync(dto);
            await _logService.AddLogAsync(GetUser(), $"Added new medicine: {dto.Name}");

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] MedicineDto dto)
        {
            await _medicineService.UpdateAsync(id, dto);
            await _logService.AddLogAsync(GetUser(), $"Updated medicine ID={id}");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _medicineService.DeleteAsync(id);
            await _logService.AddLogAsync(GetUser(), $"Deleted medicine ID={id}");

            return NoContent();
        }

        [AllowAnonymous]
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> Search([FromQuery] string query)
        {
            var results = await _medicineService.SearchAsync(query, top: 10);
            await _logService.AddLogAsync(GetUser(), $"Searched medicines with query='{query}'");

            return Ok(results);
        }


        private string GetUser()
        {
            return User.Identity?.Name ?? "UnknownUser";
        }

    }
}
