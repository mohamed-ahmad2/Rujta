using System.IdentityModel.Tokens.Jwt;
using Rujta.Infrastructure.Constants;

namespace Rujta.API.Controllers
{
    //[Authorize(Roles = "Admin,PharmacyAdmin,Manager,Pharmacist")]
    [ApiController]
    [Route("api/[controller]")]
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
