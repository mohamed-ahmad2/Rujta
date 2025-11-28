using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Rujta.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/[controller]")]
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
