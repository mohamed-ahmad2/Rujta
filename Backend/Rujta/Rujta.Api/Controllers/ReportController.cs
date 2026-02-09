using Microsoft.AspNetCore.RateLimiting;
using Rujta.Infrastructure.Identity;
using System.IdentityModel.Tokens.Jwt;

namespace Rujta.API.Controllers
{
    [Authorize(Roles = nameof(UserRole.PharmacyAdmin))]
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
            // جيب الـ PharmacyId من الـ JWT claim
            var pharmacyIdClaim = User.FindFirst("PharmacyId");
            if (pharmacyIdClaim == null)
                return Unauthorized("Pharmacy context missing.");

            int pharmacyId = int.Parse(pharmacyIdClaim.Value);

            var report = await _reportService.GetPharmacyReportAsync(pharmacyId);
            return Ok(report);
        }

    }

}
