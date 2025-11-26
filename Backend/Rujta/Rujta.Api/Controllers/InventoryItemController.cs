using Rujta.Infrastructure.Constants;

namespace Rujta.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Pharmacist")]
    public class InventoryItemController : ControllerBase
    {
        private readonly IInventoryItemService _inventoryService;
        private readonly ILogService _logService;

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

 
        [HttpGet(Name = "GetAllInventoryItems")]
        public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetAll()
        {
            int pharmacyId = GetPharmacyIdFromClaims();
            var items = await _inventoryService.GetByPharmacyAsync(pharmacyId);
            return Ok(items);
        }


        [HttpGet("{id}", Name = "GetInventoryItemById")]
        public async Task<ActionResult<InventoryItemDto>> GetById(int id)
        {
            int pharmacyId = GetPharmacyIdFromClaims();
            var item = await _inventoryService.GetByIdAsync(id);
            if (item == null || item.PharmacyID != pharmacyId)
                return NotFound();

            return Ok(item);
        }

        [HttpPost(Name = "AddInventoryItem")]
        public async Task<ActionResult> Add([FromBody] InventoryItemDto dto)
        {
            dto.PharmacyID = GetPharmacyIdFromClaims();
            await _inventoryService.AddAsync(dto);

            await _logService.AddLogAsync(
                GetCurrentUser(),
                $"Added inventory item '{dto.MedicineName}' (ID={dto.Id}) to Pharmacy {dto.PharmacyID}"
            );

            return CreatedAtRoute("GetInventoryItemById", new { id = dto.Id }, dto);
        }

        [HttpPut("{id}", Name = "UpdateInventoryItem")]
        public async Task<ActionResult> Update(int id, [FromBody] InventoryItemDto dto)
        {
            dto.PharmacyID = GetPharmacyIdFromClaims();
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

        [HttpDelete("{id}", Name = "DeleteInventoryItem")]
        public async Task<ActionResult> Delete(int id)
        {
            int pharmacyId = GetPharmacyIdFromClaims();
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

        private int GetPharmacyIdFromClaims()
        {
            var claim = User.FindFirst("PharmacyID");
            if (claim == null)
                throw new InvalidOperationException("PharmacyID claim missing in JWT.");

            return int.Parse(claim.Value);
        }
    }
}
