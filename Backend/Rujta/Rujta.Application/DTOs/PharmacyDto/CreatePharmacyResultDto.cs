namespace Rujta.Application.DTOs.PharmacyDto
{
    public class CreatePharmacyResultDto
    {
        public int PharmacyId { get; set; }
        public string AdminEmail { get; set; } = string.Empty;
        public string GeneratedPassword { get; set; } = string.Empty;
    }


}
