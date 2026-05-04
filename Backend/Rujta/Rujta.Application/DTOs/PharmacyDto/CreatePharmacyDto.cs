using Microsoft.AspNetCore.Http;

namespace Rujta.Application.DTOs.PharmacyDto
{
    public class CreatePharmacyDto
    {
        public string PharmacyName { get; set; } = string.Empty;
        public string PharmacyLocation { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string OpenHours { get; set; } = "9AM - 11PM";
        public IFormFile? Image { get; set; }

        public string ManagerName { get; set; } = string.Empty;
        public string ManagerEmail { get; set; } = string.Empty;
        public string ManagerPhone { get; set; } = string.Empty;
        public string ManagerQualification { get; set; } = string.Empty;
        public int ManagerExperienceYears { get; set; }


        public int? ParentPharmacyId { get; set; }
    }
}