using Rujta.Infrastructure.Identity;


namespace Rujta.API.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/prescription")]
    public class PrescriptionController : ControllerBase
    {
        private readonly IPrescriptionService _service;

        public PrescriptionController(IPrescriptionService service)
        {
            _service = service;
        }

        [HttpPost("scan")]
        public async Task<IActionResult> Scan(List<IFormFile> images)
        {
            if (images == null || !images.Any())
                return BadRequest("At least one image is required");

            var result = await _service.AnalyzePrescriptionAsync(
                images.Select(i => i.OpenReadStream()).ToList(),
                0);

            return Ok(result);
        }
    }
}
