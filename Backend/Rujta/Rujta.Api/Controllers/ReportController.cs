using Microsoft.AspNetCore.RateLimiting;
using Rujta.Infrastructure.Identity;
using System.IdentityModel.Tokens.Jwt;

namespace Rujta.API.Controllers
{
    [Authorize(Roles = nameof(UserRole.SuperAdmin))]
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class ReportController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("PharmacyReport")]
        public async Task<IActionResult> GetPharmacyReport()
        {
            var adminIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (adminIdClaim == null) return Forbid();

            var adminId = Guid.Parse(adminIdClaim);

            var report = await _reportService.GetPharmacyReportAsync(adminId);
            return Ok(report);
        }
    }

}
