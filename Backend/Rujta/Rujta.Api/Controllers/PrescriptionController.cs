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
        public async Task<IActionResult> Scan(IFormFile image)
        {
            if (image == null)
                return BadRequest("Image required");

            var result = await _service.AnalyzePrescriptionAsync(
                image.OpenReadStream(),
                0);

            return Ok(result);
        }
    }
}
