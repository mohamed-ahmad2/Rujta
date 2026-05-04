namespace Rujta.Application.DTOs.PharmacyDto
{
    public class CreatePharmacyResultDto
    {
        public int PharmacyId { get; set; }
        public Guid ManagerId { get; set; }
        public Guid? AdminId { get; set; }
        public string ManagerEmail { get; set; } = string.Empty;
        public string GeneratedPassword { get; set; } = string.Empty;
    }
}