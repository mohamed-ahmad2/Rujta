using Rujta.Infrastructure.Constants;

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

        [Authorize(Roles = "Admin,PharmacyAdmin")]
        [HttpPost]
        public async Task<ActionResult> Add([FromBody] MedicineDto dto)
        {
            await _medicineService.AddAsync(dto);
            await _logService.AddLogAsync(GetUser(), $"Added new medicine: {dto.Name}");

            return Ok();
        }

        [Authorize(Roles = "Admin,PharmacyAdmin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] MedicineDto dto)
        {
            await _medicineService.UpdateAsync(id, dto);
            await _logService.AddLogAsync(GetUser(), $"Updated medicine ID={id}");

            return NoContent();
        }

        [Authorize(Roles = "Admin,PharmacyAdmin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _medicineService.DeleteAsync(id);
            await _logService.AddLogAsync(GetUser(), $"Deleted medicine ID={id}");

            return NoContent();
        }

        private string GetUser()
        {
            return User.Identity?.Name ?? AuthMessages.UnknownUser;
        }

    }
}
