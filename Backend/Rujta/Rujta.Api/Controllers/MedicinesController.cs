using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

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
            try
            {
                var medicines = await _medicineService.GetAllAsync();
                return Ok(medicines);
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Error fetching all medicines: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MedicineDto>> GetById(int id)
        {
            try
            {
                var medicine = await _medicineService.GetByIdAsync(id);
                if (medicine == null)
                    return NotFound($"Medicine with ID={id} not found.");

                return Ok(medicine);
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Error fetching medicine ID={id}: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }

        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPost]
        public async Task<ActionResult> Add([FromBody] MedicineDto dto)
        {
            if (dto == null)
                return BadRequest("Medicine data cannot be null.");

            try
            {
                await _medicineService.AddAsync(dto);
                await _logService.AddLogAsync(GetUser(), $"Added new medicine: {dto.Name}");
                return Ok();
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Error adding medicine {dto.Name}: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }

        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] MedicineDto dto)
        {
            if (dto == null)
                return BadRequest("Medicine data cannot be null.");

            try
            {
                var existing = await _medicineService.GetByIdAsync(id);
                if (existing == null)
                    return NotFound($"Medicine with ID={id} not found.");

                await _medicineService.UpdateAsync(id, dto);
                await _logService.AddLogAsync(GetUser(), $"Updated medicine ID={id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Error updating medicine ID={id}: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }

        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var existing = await _medicineService.GetByIdAsync(id);
                if (existing == null)
                    return NotFound($"Medicine with ID={id} not found.");

                await _medicineService.DeleteAsync(id);
                await _logService.AddLogAsync(GetUser(), $"Deleted medicine ID={id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(GetUser(), $"Error deleting medicine ID={id}: {ex.Message}");
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }

        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<MedicineDto>>> Filter([FromQuery] MedicineFilterDto filter, CancellationToken cancellationToken)
        {
            try
            {
                var medicines = await _medicineService
                    .GetFilteredAsync(filter, cancellationToken);

                if (medicines == null || !medicines.Any())
                    return Ok(Enumerable.Empty<MedicineDto>());

                return Ok(medicines);
            }
            catch (Exception ex)
            {
                await _logService.AddLogAsync(
                    GetUser(),
                    $"Error filtering medicines: {ex.Message}");

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    "An unexpected error occurred while filtering medicines.");
            }
        }


        private string GetUser()
        {
            return User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Name)
                   ?? User.Identity?.Name
                   ?? AuthMessages.UnknownUser;
        }
    }
}
