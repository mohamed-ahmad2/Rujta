using Microsoft.AspNetCore.RateLimiting;
using Rujta.Infrastructure.Constants;
using Rujta.Infrastructure.Identity;
using System.IdentityModel.Tokens.Jwt;

namespace Rujta.API.Controllers
{
    [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("Fixed")]
    public class CompanyController : ControllerBase
    {
        private readonly ICompanyService _companyService;
        private readonly ILogService _logService;

        public CompanyController(ICompanyService companyService, ILogService logService)
        {
            _companyService = companyService;
            _logService = logService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CompanyDto>>> GetAll(CancellationToken cancellationToken)
        {
            var companies = await _companyService.GetAllAsync(cancellationToken);
            await _logService.AddLogAsync(GetUser(), "Fetched all companies");

            if (companies == null || !companies.Any())
                return NotFound(new { Message = "No companies found." });

            return Ok(companies);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CompanyDto>> GetById(int id, CancellationToken cancellationToken)
        {
            var company = await _companyService.GetByIdAsync(id, cancellationToken);
            if (company == null)
                return NotFound(new { Message = $"Company with ID={id} not found." });

            return Ok(company);
        }

        [HttpGet("pharmacy-companies")]
        [Authorize(Roles = $"{nameof(UserRole.PharmacyAdmin)},{nameof(UserRole.Pharmacist)}")]
        public async Task<ActionResult<IEnumerable<CompanyDto>>> GetPharmacyCompanies(CancellationToken cancellationToken)
        {
            var pharmacyIdClaim = User.FindFirst("PharmacyId");

            if (pharmacyIdClaim == null || !int.TryParse(pharmacyIdClaim.Value, out int pharmacyId))
                return Unauthorized(new { Message = "PharmacyId claim is missing or invalid in the token." });

            var companies = await _companyService.GetCompaniesMedicinesAsync(pharmacyId, cancellationToken);

            if (companies == null || !companies.Any())
                return NotFound(new { Message = $"No companies found for PharmacyId={pharmacyId}." });

            await _logService.AddLogAsync(GetUser(), $"Fetched companies for PharmacyId={pharmacyId}");

            return Ok(companies);
        }

        [HttpPost]
        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)}")]
        public async Task<ActionResult> Add([FromBody] CompanyDto dto, CancellationToken cancellationToken)
        {
            if (dto == null)
                return BadRequest(new { Message = "Company data is required." });

            await _companyService.AddAsync(dto, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Added new Company: {dto.Name}");

            return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)}")]
        public async Task<ActionResult> Update(int id, [FromBody] CompanyDto dto, CancellationToken cancellationToken)
        {
            if (dto == null)
                return BadRequest(new { Message = "Company data is required." });

            await _companyService.UpdateAsync(id, dto, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Updated Company ID={id}");

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{nameof(UserRole.SuperAdmin)},{nameof(UserRole.PharmacyAdmin)}")]
        public async Task<ActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _companyService.DeleteAsync(id, cancellationToken);
            await _logService.AddLogAsync(GetUser(), $"Deleted Company ID={id}");

            return NoContent();
        }

        private string GetUser()
        {
            return User.FindFirstValue(JwtRegisteredClaimNames.Name)
                ?? User.Identity?.Name
                ?? ApiMessages.UnknownUser;
        }
    }
}