using Microsoft.AspNetCore.RateLimiting;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

namespace Rujta.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
    [EnableRateLimiting("Fixed")]
    public class InventoryItemController : ControllerBase
    {
        private readonly IInventoryItemService _inventoryService;
        private readonly ILogService _logService;
		
		 private const string MissingPharmacyIdMessage = "PharmacyId claim missing in JWT.";

        public InventoryItemController(IInventoryItemService inventoryService, ILogService logService)
        {
            _inventoryService = inventoryService;
            _logService = logService;
        }

        private string GetCurrentUser()
        {
            return User.Identity?.Name
                   ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? AuthMessages.UnknownUser;
        }

        private bool TryGetPharmacyId(out int pharmacyId)
        {
            pharmacyId = 0;
            var claim = User.FindFirst("PharmacyId");
            if (claim == null) return false;
            return int.TryParse(claim.Value, out pharmacyId);
        }


        [HttpGet(Name = "GetAllInventoryItems")]
        public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetAll()
        {
            var items = await _inventoryService.GetAllAsync();
            return Ok(items);
        }

        [HttpGet("{id:int}", Name = "GetInventoryItemById")]
        public async Task<ActionResult<InventoryItemDto>> GetById(int id)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = MissingPharmacyIdMessage });

            var item = await _inventoryService.GetByIdAsync(id);
            if (item == null || item.PharmacyID != pharmacyId)
                return NotFound();

            return Ok(item);
        }

        [HttpPost(Name = "AddInventoryItem")]
        public async Task<ActionResult> Add([FromBody] InventoryItemDto dto)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = MissingPharmacyIdMessage});

            dto.PharmacyID = pharmacyId;
            await _inventoryService.AddAsync(dto);

            await _logService.AddLogAsync(
                GetCurrentUser(),
                $"Added inventory item '{dto.MedicineName}' (ID={dto.Id}) to Pharmacy {dto.PharmacyID}"
            );

            return CreatedAtRoute("GetInventoryItemById", new { id = dto.Id }, dto);
        }

        [HttpPut("{id:int}", Name = "UpdateInventoryItem")]
        public async Task<ActionResult> Update(int id, [FromBody] InventoryItemDto dto)
        {
            
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = MissingPharmacyIdMessage });

            dto.PharmacyID = pharmacyId;
            try
            {
                await _inventoryService.UpdateAsync(id, dto);

                await _logService.AddLogAsync(
                    GetCurrentUser(),
                    $"Updated inventory item (ID={id}) in Pharmacy {dto.PharmacyID}"
                );

                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id:int}", Name = "DeleteInventoryItem")] 
        public async Task<ActionResult> Delete(int id)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = MissingPharmacyIdMessage });

            var item = await _inventoryService.GetByIdAsync(id);
            if (item == null || item.PharmacyID != pharmacyId)
                return NotFound();

            await _inventoryService.DeleteAsync(id);

            await _logService.AddLogAsync(
                GetCurrentUser(),
                $"Deleted inventory item (ID={id}) from Pharmacy {pharmacyId}"
            );

            return NoContent();
        }

        [HttpGet("products", Name = "GetInventoryProducts")]
        public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetInventoryProducts()
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = MissingPharmacyIdMessage });

            var products = await _inventoryService.GetByPharmacyAsync(pharmacyId);
            return Ok(products);
        }
    }
}