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

        public string? GoogleId { get; set; }      // store the 'sub' from Google token
        public string? PictureUrl { get; set; }   // optional, store user's Google profile picture
        public DateTime? LastLogin { get; set; }  // track last login time




        public ICollection<Prescription>? Prescriptions { get; set; }
        public ICollection<SellDrugViaPharmacy>? SellDrugViaPharmacies { get; set; }
        public ICollection<Order>? Orders { get; set; }
    }
}
