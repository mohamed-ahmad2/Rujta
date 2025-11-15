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

        public InventoryItemController(IInventoryItemService inventoryService)
        {
            _inventoryService = inventoryService;
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
