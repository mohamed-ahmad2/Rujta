using Microsoft.AspNetCore.RateLimiting;

namespace Rujta.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class ErrorController : ControllerBase
    {
        [HttpGet]
        public IActionResult HandleError()
        {
            return Problem(
                title: "Unexpected error occurred",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
    }
}
