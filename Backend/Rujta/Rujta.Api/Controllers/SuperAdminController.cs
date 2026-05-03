using Rujta.Application.DTOs.PharmacyDto;
using Rujta.Application.DTOs.Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices.IAuth;
using Rujta.Infrastructure.Identity;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/super-admin")]
    [Authorize(Roles = nameof(UserRole.SuperAdmin))]
    public class SuperAdminController : ControllerBase
    {
        private readonly ISuperAdminService _service;

        public SuperAdminController(ISuperAdminService service)
        {
            _service = service;
        }

      
        [HttpPost("pharmacies")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreatePharmacy( [FromForm] CreatePharmacyDto dto,CancellationToken cancellationToken)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request data." });

            try
            {
                var result = await _service.CreatePharmacyAsync(dto, cancellationToken);
                return Ok(result);
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

       
        [HttpGet("pharmacies")]
        public async Task<IActionResult> GetAllPharmacies(CancellationToken cancellationToken)
        {
            var pharmacies = await _service.GetAllPharmaciesAsync(cancellationToken);
            return Ok(pharmacies);
        }

    
        [HttpGet("pharmacies/{pharmacyId:int}")]
        public async Task<IActionResult> GetPharmacy(int pharmacyId,CancellationToken cancellationToken)
        {
            var pharmacy = await _service.GetPharmacyByIdAsync(pharmacyId, cancellationToken);

            if (pharmacy == null)
                return NotFound(new { message = "Pharmacy not found." });

            return Ok(pharmacy);
        }

  
        [HttpPut("pharmacies/{pharmacyId:int}")]
        public async Task<IActionResult> UpdatePharmacy(int pharmacyId,[FromBody] UpdatePharmacyDto dto,CancellationToken cancellationToken)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request data." });

            try
            {
                var updatedPharmacy = await _service.UpdatePharmacyAsync(pharmacyId, dto, cancellationToken);
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
        }

 
        [HttpPost("pharmacies/{pharmacyId:int}/reset-password")]
        public async Task<IActionResult> ResetManagerPassword(int pharmacyId,CancellationToken cancellationToken)
        {
            try
            {
                var newPassword = await _service.ResetPharmacyManagerPasswordAsync(pharmacyId, cancellationToken);
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
        public async Task<IActionResult> GetTotalOrders(int pharmacyId,CancellationToken cancellationToken)
        {
            try
            {
                var totalOrders = await _service.GetPharmacyTotalOrdersAsync(pharmacyId, cancellationToken);
                return Ok(new { totalOrders });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

   
        [HttpGet("top-pharmacies")]
        public async Task<IActionResult> GetTopPharmacies([FromQuery] int count = 5,CancellationToken cancellationToken = default)
        {
            var result = await _service.GetTopPharmaciesAsync(count, cancellationToken);
            return Ok(result);
        }

 
        [HttpDelete("pharmacies/{pharmacyId:int}")]
        public async Task<IActionResult> DeletePharmacy(int pharmacyId,CancellationToken cancellationToken)
        {
            try
            {
                await _service.DeletePharmacyAsync(pharmacyId, cancellationToken);
                return Ok(new { message = "Pharmacy deleted (inactivated) successfully" });
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
        public async Task<IActionResult> RestorePharmacy(int pharmacyId,CancellationToken cancellationToken)
        {
            try
            {
                await _service.RestorePharmacyAsync(pharmacyId, cancellationToken);
                return Ok(new { message = "Pharmacy restored successfully" });
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

      
        [HttpGet("pharmacies/main")]
        public async Task<IActionResult> GetMainPharmacies(CancellationToken cancellationToken)
        {
            var result = await _service.GetMainPharmaciesAsync(cancellationToken);
            return Ok(result);
        }

     
        [HttpGet("pharmacies/{parentId:int}/branches")]
        public async Task<IActionResult> GetBranches(int parentId,CancellationToken cancellationToken)
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
        public async Task<IActionResult> GetPharmacyTree(int rootId, CancellationToken cancellationToken)
        {
            var tree = await _service.GetPharmacyTreeAsync(rootId, cancellationToken);
            if (tree == null)
                return NotFound(new { message = "Pharmacy not found." });

            return Ok(tree);
        }

    
        [HttpPost("pharmacies/{branchId:int}/detach")]
        public async Task<IActionResult> DetachBranch(int branchId,CancellationToken cancellationToken)
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
        public async Task<IActionResult> AttachBranch(int branchId,int parentId,CancellationToken cancellationToken)
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