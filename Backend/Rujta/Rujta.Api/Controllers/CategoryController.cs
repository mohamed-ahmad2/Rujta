using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.DTOs.MedicineDtos;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;
using System.IdentityModel.Tokens.Jwt;

namespace Rujta.API.Controllers
{
    [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogService _logService;

        public CategoryController(ICategoryService categoryService, ILogService logService)
        {
            _categoryService = categoryService;
            _logService = logService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll(CancellationToken cancellationToken)
        {
            var categories = await _categoryService.GetAllAsync(cancellationToken);
            await _logService.AddLogAsync(GetUser(), "Fetched all categories");

            if (categories == null || !categories.Any())
                return NotFound(new { Message = "No categories found." });

            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetById(int id, CancellationToken cancellationToken)
        {
            var category = await _categoryService.GetByIdAsync(id, cancellationToken);
            if (category == null) return NotFound(new { Message = $"Category with ID={id} not found." });

            return Ok(category);
        }


        [HttpGet("pharmacy-categories")]
        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetPharmacyCategories(CancellationToken cancellationToken)
        {
            var pharmacyIdClaim = User.FindFirst("PharmacyId");

            if (pharmacyIdClaim == null || !int.TryParse(pharmacyIdClaim.Value, out int pharmacyId))
                return Unauthorized(new { Message = "PharmacyId claim is missing or invalid in the token." });

            var categories = await _categoryService.GetCategoriesMedicinesAsync(pharmacyId, cancellationToken);

            if (categories == null || !categories.Any())
                return NotFound(new { Message = $"No categories found for PharmacyId={pharmacyId}." });

            await _logService.AddLogAsync(GetUser(), $"Fetched categories for PharmacyId={pharmacyId}");

            return Ok(categories);
        }

        [HttpGet("by-pharmacy/{pharmacyId:int}")]
        [AllowAnonymous] 
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategoriesByPharmacy(int pharmacyId,CancellationToken cancellationToken)
        {
            if (pharmacyId <= 0)
                return BadRequest(new { Message = "Invalid PharmacyId." });

            try
            {
                var categories = await _categoryService.GetCategoriesMedicinesAsync(pharmacyId, cancellationToken);

                if (categories == null || !categories.Any())
                    return Ok(Array.Empty<CategoryDto>());

                return Ok(categories);
            }
            catch (KeyNotFoundException)
            {
                return Ok(Array.Empty<CategoryDto>()); 
            }
        }

        [HttpPost]
        public async Task<ActionResult> Add([FromBody] CategoryDto dto, CancellationToken cancellationToken)
        {
            if (dto == null) return BadRequest(new { Message = "Category data is required." });

            await _categoryService.AddAsync(dto, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Added new Category: {dto.Name}");

            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] CategoryDto dto, CancellationToken cancellationToken)
        {
            if (dto == null) return BadRequest(new { Message = "Category data is required." });

            await _categoryService.UpdateAsync(id, dto, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Updated Category ID={id}");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _categoryService.DeleteAsync(id, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Deleted Category ID={id}");

            return NoContent();
        }

        private string GetUser()
        {
            return User.FindFirstValue(JwtRegisteredClaimNames.Name) ?? User.Identity?.Name ?? ApiMessages.UnknownUser;
        }
    }
}