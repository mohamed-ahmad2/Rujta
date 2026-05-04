using Rujta.Application.DTOs.PharmacyDto;
using Rujta.Application.DTOs.PharmacyDtos;
using Rujta.Application.Interfaces.InterfaceServices.IAuth;
using Rujta.Infrastructure.Identity;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/super-admin")]
    [Authorize(Roles = nameof(UserRole.SuperAdmin))]
    [Produces("application/json")]
    public class SuperAdminController : ControllerBase
    {
        private readonly ISuperAdminService _service;
        private readonly ILogger<SuperAdminController> _logger;

        public SuperAdminController(
            ISuperAdminService service,
            ILogger<SuperAdminController> logger)
        {
            _service = service;
            _logger = logger;
        }


        private bool TryGetAdminId(out Guid adminId)
        {
            adminId = Guid.Empty;
            var claim = User.FindFirstValue("domainPersonId");

            if (string.IsNullOrWhiteSpace(claim))
                return false;

            return Guid.TryParse(claim, out adminId);
        }

        private static bool IsAddressValid(CreatePharmacyDto dto)
        {
            return dto.Address != null &&
                   (!string.IsNullOrWhiteSpace(dto.Address.Street) ||
                    !string.IsNullOrWhiteSpace(dto.Address.City) ||
                    !string.IsNullOrWhiteSpace(dto.Address.Governorate));
        }

        private static bool IsAddressValid(UpdatePharmacyDto dto)
        {
            return dto.Address != null &&
                   (!string.IsNullOrWhiteSpace(dto.Address.Street) ||
                    !string.IsNullOrWhiteSpace(dto.Address.City) ||
                    !string.IsNullOrWhiteSpace(dto.Address.Governorate));
        }


        [HttpPost("pharmacies")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(CreatePharmacyResultDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreatePharmacy(
            [FromForm] CreatePharmacyDto dto,
            CancellationToken cancellationToken)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request data." });

         
            if (string.IsNullOrWhiteSpace(dto.PharmacyName))
                return BadRequest(new { message = "Pharmacy name is required." });

            if (string.IsNullOrWhiteSpace(dto.ManagerEmail))
                return BadRequest(new { message = "Manager email is required." });

            if (string.IsNullOrWhiteSpace(dto.ManagerName))
                return BadRequest(new { message = "Manager name is required." });

            if (string.IsNullOrWhiteSpace(dto.ManagerPhone))
                return BadRequest(new { message = "Manager phone is required." });

            
            if (!IsAddressValid(dto))
                return BadRequest(new
                {
                    message = "Address is required (Street, City, or Governorate at minimum)."
                });

            if (!TryGetAdminId(out var adminGuid))
                return Unauthorized(new { message = "AdminId not found or invalid in token." });

            try
            {
                var result = await _service.CreatePharmacyAsync(dto, adminGuid, cancellationToken);

                return CreatedAtAction(
                    nameof(GetPharmacy),
                    new { pharmacyId = result.PharmacyId },
                    result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create pharmacy");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred while creating the pharmacy." });
            }
        }


        [HttpGet("pharmacies")]
        [ProducesResponseType(typeof(IEnumerable<PharmacyDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllPharmacies(CancellationToken cancellationToken)
        {
            try
            {
                var pharmacies = await _service.GetAllPharmaciesAsync(cancellationToken);
                return Ok(pharmacies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch pharmacies");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred while fetching pharmacies." });
            }
        }

        [HttpGet("pharmacies/{pharmacyId:int}", Name = nameof(GetPharmacy))]
        [ProducesResponseType(typeof(PharmacyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPharmacy(
            int pharmacyId,
            CancellationToken cancellationToken)
        {
            var pharmacy = await _service.GetPharmacyByIdAsync(pharmacyId, cancellationToken);

            if (pharmacy == null)
                return NotFound(new { message = "Pharmacy not found." });

            return Ok(pharmacy);
        }


        [HttpPut("pharmacies/{pharmacyId:int}")]
        [Consumes("application/json")]
        [ProducesResponseType(typeof(PharmacyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePharmacy(
            int pharmacyId,
            [FromBody] UpdatePharmacyDto dto,
            CancellationToken cancellationToken)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request data." });

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Pharmacy name is required." });

            if (!IsAddressValid(dto))
                return BadRequest(new
                {
                    message = "Address is required (Street, City, or Governorate at minimum)."
                });

            try
            {
                var updatedPharmacy = await _service.UpdatePharmacyAsync(
                    pharmacyId, dto, cancellationToken);
                return Ok(updatedPharmacy);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update pharmacy {PharmacyId}", pharmacyId);
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred while updating the pharmacy." });
            }
        }

        [HttpDelete("pharmacies/{pharmacyId:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletePharmacy(
            int pharmacyId,
            CancellationToken cancellationToken)
        {
            try
            {
                await _service.DeletePharmacyAsync(pharmacyId, cancellationToken);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("pharmacies/{pharmacyId:int}/restore")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RestorePharmacy(
            int pharmacyId,
            CancellationToken cancellationToken)
        {
            try
            {
                await _service.RestorePharmacyAsync(pharmacyId, cancellationToken);
                return Ok(new { message = "Pharmacy restored successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("pharmacies/{pharmacyId:int}/reset-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ResetManagerPassword(
            int pharmacyId,
            CancellationToken cancellationToken)
        {
            try
            {
                var newPassword = await _service.ResetPharmacyManagerPasswordAsync(
                    pharmacyId, cancellationToken);
                return Ok(new { newPassword });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        [HttpGet("pharmacies/{pharmacyId:int}/total-orders")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetTotalOrders(
            int pharmacyId,
            CancellationToken cancellationToken)
        {
            try
            {
                var totalOrders = await _service.GetPharmacyTotalOrdersAsync(
                    pharmacyId, cancellationToken);
                return Ok(new { totalOrders });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet("top-pharmacies")]
        [ProducesResponseType(typeof(List<PharmacyStatsDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetTopPharmacies(
            [FromQuery] int count = 5,
            CancellationToken cancellationToken = default)
        {
            if (count <= 0 || count > 100)
                return BadRequest(new { message = "Count must be between 1 and 100." });

            var result = await _service.GetTopPharmaciesAsync(count, cancellationToken);
            return Ok(result);
        }

        [HttpGet("pharmacies/main")]
        [ProducesResponseType(typeof(IEnumerable<PharmacyDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetMainPharmacies(CancellationToken cancellationToken)
        {
            var result = await _service.GetMainPharmaciesAsync(cancellationToken);
            return Ok(result);
        }

        [HttpGet("pharmacies/{parentId:int}/branches")]
        [ProducesResponseType(typeof(IEnumerable<BranchDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetBranches(
            int parentId,
            CancellationToken cancellationToken)
        {
            try
            {
                var branches = await _service.GetBranchesAsync(parentId, cancellationToken);
                return Ok(branches);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("pharmacies/{rootId:int}/tree")]
        [ProducesResponseType(typeof(PharmacyTreeDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetPharmacyTree(
            int rootId,
            CancellationToken cancellationToken)
        {
            var tree = await _service.GetPharmacyTreeAsync(rootId, cancellationToken);
            if (tree == null)
                return NotFound(new { message = "Pharmacy not found." });

            return Ok(tree);
        }

        [HttpPost("pharmacies/{branchId:int}/detach")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DetachBranch(
            int branchId,
            CancellationToken cancellationToken)
        {
            try
            {
                await _service.DetachBranchAsync(branchId, cancellationToken);
                return Ok(new { message = "Branch detached successfully and is now a main pharmacy." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("pharmacies/{branchId:int}/attach/{parentId:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AttachBranch(
            int branchId,
            int parentId,
            CancellationToken cancellationToken)
        {
            try
            {
                await _service.AttachBranchAsync(branchId, parentId, cancellationToken);
                return Ok(new { message = "Branch attached successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}