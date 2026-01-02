using Rujta.Infrastructure.Identity;

namespace Rujta.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = nameof(UserRole.SuperAdmin))]
    public class LogsController : ControllerBase
    {
        private readonly ILogService _logService;

        public LogsController(ILogService logService)
        {
            _logService = logService;
        }

        [HttpGet(Name = "GetAllLogs")]
        public async Task<ActionResult<IEnumerable<LogDto>>> GetAll()
        {
            var logs = await _logService.GetAllAsync();
            return Ok(logs);
        }

        [HttpGet("paged", Name = "GetPagedLogs")]
        public async Task<ActionResult<IEnumerable<LogDto>>> GetPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var logs = await _logService.GetPagedAsync(page, pageSize);
            return Ok(logs);
        }
    }
}
