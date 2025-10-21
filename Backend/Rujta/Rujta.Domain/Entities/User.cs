using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public class User : Person
    {
        public string? MedicalHistory { get; set; }
        public string? Allergies { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? ChronicDiseases { get; set; }
        public double? Weight { get; set; }
        public double? Height { get; set; }
    }
}
