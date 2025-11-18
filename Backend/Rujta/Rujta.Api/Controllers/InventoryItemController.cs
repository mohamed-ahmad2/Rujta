using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Rujta.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Pharmacist")]
    public class InventoryItemController : ControllerBase
    {
        private readonly IInventoryItemService _inventoryService;
        ILogService _logService;

        public InventoryItemController(IInventoryItemService inventoryService , ILogService logService)
        {
            _inventoryService = inventoryService;
            _logService = logService;


        }

        // ----------------- Get all items -----------------
        [HttpGet(Name = "GetAllInventoryItems")]
        public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetAll()
        {
            int pharmacyId = GetPharmacyIdFromClaims();
            var items = await _inventoryService.GetByPharmacyAsync(pharmacyId);
            return Ok(items);
        }

        // ----------------- Get single item -----------------
        [HttpGet("{id}", Name = "GetInventoryItemById")]
        public async Task<ActionResult<InventoryItemDto>> GetById(int id)
        {
            int pharmacyId = GetPharmacyIdFromClaims();
            var item = await _inventoryService.GetByIdAsync(id);
            if (item == null || item.PharmacyID != pharmacyId)
                return NotFound();

            return Ok(item);
        }

        // ----------------- Add new item -----------------
        [HttpPost(Name = "AddInventoryItem")]
        public async Task<ActionResult> Add([FromBody] InventoryItemDto dto)
        {
            dto.PharmacyID = GetPharmacyIdFromClaims();
            await _inventoryService.AddAsync(dto);
            await _logService.AddLogAsync(
    User.Identity.Name,
    $"Added inventory item '{dto.MedicineName}' (ID={dto.Id}) to Pharmacy {dto.PharmacyID}"
);

            return CreatedAtRoute("GetInventoryItemById", new { id = dto.Id }, dto);
        }

        // ----------------- Update item -----------------
        [HttpPut("{id}", Name = "UpdateInventoryItem")]
        public async Task<ActionResult> Update(int id, [FromBody] InventoryItemDto dto)
        {
            dto.PharmacyID = GetPharmacyIdFromClaims();
            try
            {
                await _inventoryService.UpdateAsync(id, dto);
                await _logService.AddLogAsync(
    User.Identity.Name,
    $"Updated inventory item (ID={id}) in Pharmacy {dto.PharmacyID}"
);

                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        // ----------------- Delete item -----------------
        [HttpDelete("{id}", Name = "DeleteInventoryItem")]
        public async Task<ActionResult> Delete(int id)
        {
            int pharmacyId = GetPharmacyIdFromClaims();
            var item = await _inventoryService.GetByIdAsync(id);
            if (item == null || item.PharmacyID != pharmacyId)
                return NotFound();

            await _inventoryService.DeleteAsync(id);
            await _logService.AddLogAsync(
    User.Identity.Name,
    $"Deleted inventory item (ID={id}) from Pharmacy {pharmacyId}"
);

            return NoContent();
        }

        // ----------------- Helper: Get PharmacyID from JWT claims -----------------
        private int GetPharmacyIdFromClaims()
        {
            var claim = User.FindFirst("PharmacyID");
            if (claim == null)
                throw new System.Exception("PharmacyID claim missing in JWT.");
            return int.Parse(claim.Value);
        }
    }
}
