using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.DTOs.Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Infrastructure.Identity;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/super-admin")]
    [Authorize(Roles = nameof(UserRole.SuperAdmin))] // Only SuperAdmin can access
    public class SuperAdminController : ControllerBase
    {
        private readonly ISuperAdminService _service;

        public SuperAdminController(ISuperAdminService service)
        {
            _service = service;
        }

        // ================= CREATE PHARMACY =================
        [HttpPost("pharmacies")]
        public async Task<IActionResult> CreatePharmacy([FromBody] CreatePharmacyDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request data." });

            var result = await _service.CreatePharmacyAsync(dto);
            return Ok(result);
        }

        // ================= GET ALL PHARMACIES =================
        [HttpGet("Get_pharmacies")]
        public async Task<IActionResult> GetAllPharmacies()
        {
            var pharmacies = await _service.GetAllPharmaciesAsync();
            return Ok(pharmacies);
        }

        // ================= GET PHARMACY BY ID =================
        [HttpGet("Get_Pharmacy_By_Id/{pharmacyId:int}")]
        public async Task<IActionResult> GetPharmacy(int pharmacyId, CancellationToken cancellationToken)
        {
            var pharmacy = await _service.GetPharmacyByIdAsync(pharmacyId, cancellationToken);

            if (pharmacy == null)
                return NotFound(new { message = "Pharmacy not found." });

            return Ok(pharmacy);
        }

        // ================= UPDATE PHARMACY =================
        [HttpPut("Update_Pharmacy/{pharmacyId:int}")]
        public async Task<IActionResult> UpdatePharmacy(
            int pharmacyId,
            [FromBody] UpdatePharmacyDto dto,
            CancellationToken cancellationToken)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request data." });

            try
            {
                var updatedPharmacy = await _service.UpdatePharmacyAsync(pharmacyId, dto, cancellationToken);
                return Ok(updatedPharmacy);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ================= RESET PHARMACY ADMIN PASSWORD =================
        [HttpPost("pharmacies/{pharmacyId:int}/reset-password")]
        public async Task<IActionResult> ResetAdminPassword(
            int pharmacyId,
            CancellationToken cancellationToken)
        {
            try
            {
                var newPassword = await _service.ResetPharmacyAdminPasswordAsync(pharmacyId, cancellationToken);
                return Ok(new { newPassword });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
