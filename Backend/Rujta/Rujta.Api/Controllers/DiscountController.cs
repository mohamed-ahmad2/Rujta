using Microsoft.AspNetCore.RateLimiting;
using Rujta.Application.Exceptions;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;

namespace Rujta.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
    public class DiscountsController : ControllerBase
    {
        private readonly IDiscountService _discountService;
        private readonly ILogService _logService;

        public DiscountsController(
            IDiscountService discountService,
            ILogService logService)
        {
            _discountService = discountService;
            _logService = logService;
        }

        private string GetUser() =>
            User.Identity?.Name ?? LogConstants.UnknownUser;

        private bool TryGetPharmacyId(out int pharmacyId)
        {
            pharmacyId = 0;
            var claim = User.FindFirst("PharmacyId");
            if (claim == null) return false;
            return int.TryParse(claim.Value, out pharmacyId);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var discounts = await _discountService
                .GetByPharmacyAsync(pharmacyId, cancellationToken);

            await _logService.AddLogAsync(
                GetUser(),
                $"Fetched all discounts for Pharmacy {pharmacyId}");

            return Ok(discounts);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            var discount = await _discountService
                .GetByIdAsync(id, pharmacyId, cancellationToken);

            if (discount == null)
                return NotFound(new { message = "Discount not found" });

            await _logService.AddLogAsync(
                GetUser(),
                $"Fetched discount ID={id} for Pharmacy {pharmacyId}");

            return Ok(discount);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDiscountDto dto,CancellationToken cancellationToken)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            try
            {
                var discount = await _discountService
                    .CreateDiscountAsync(dto, pharmacyId);

                await _logService.AddLogAsync(
                    GetUser(),
                    $"Created discount '{dto.Name}' for Pharmacy {pharmacyId}");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = discount.Id },
                    discount);
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}/deactivate")]
        public async Task<IActionResult> Deactivate(int id, CancellationToken cancellationToken)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            try
            {
                await _discountService.DeactivateAsync(id, pharmacyId, cancellationToken);

                await _logService.AddLogAsync(
                    GetUser(),
                    $"Deactivated discount ID={id} for Pharmacy {pharmacyId}");

                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            if (!TryGetPharmacyId(out int pharmacyId))
                return Unauthorized(new { message = "PharmacyId claim missing in JWT." });

            try
            {
                await _discountService.DeleteAsync(id, pharmacyId, cancellationToken);

                await _logService.AddLogAsync(
                    GetUser(),
                    $"Deleted discount ID={id} from Pharmacy {pharmacyId}");

                return NoContent();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}