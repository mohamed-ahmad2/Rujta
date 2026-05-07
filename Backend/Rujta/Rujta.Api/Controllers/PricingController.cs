using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/pricing")]
    public class PricingController : ControllerBase
    {
        private readonly IPricingService _pricingService;

        public PricingController(IPricingService pricingService)
        {
            _pricingService = pricingService;
        }

        [HttpGet]
        public async Task<ActionResult<PricingConfigDto>> Get(CancellationToken cancellationToken)
        {
            var result = await _pricingService.GetAsync(cancellationToken);
            return Ok(result);
        }

        [HttpPut]
        public async Task<ActionResult<PricingConfigDto>> Update(
            [FromBody] PricingConfigDto dto,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _pricingService.UpdateAsync(dto, cancellationToken);
            return Ok(result);
        }
    }
}