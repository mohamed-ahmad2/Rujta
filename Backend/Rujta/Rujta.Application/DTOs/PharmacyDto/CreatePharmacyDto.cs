using Microsoft.AspNetCore.Http;
using Rujta.Application.DTOs.CustomerDtos;

namespace Rujta.Application.DTOs.PharmacyDto
{
    public class CreatePharmacyDto
    {
        public string PharmacyName { get; set; } = string.Empty;
        public string OpenHours { get; set; } = "9AM - 11PM";
        public IFormFile? Image { get; set; }
        public AddressDto Address { get; set; } = new();

        public string ManagerName { get; set; } = string.Empty;
        public string ManagerEmail { get; set; } = string.Empty;
        public string ManagerPhone { get; set; } = string.Empty;
        public string ManagerQualification { get; set; } = string.Empty;
        public int ManagerExperienceYears { get; set; }

        public int? ParentPharmacyId { get; set; }
    }
}