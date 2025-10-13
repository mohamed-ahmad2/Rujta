using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Models
{
    public class Pharmacy
    {
        [Key]
        public int PharmacyID { get; set; }

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        [MaxLength(20)]
        public string ContactNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string OpenHours { get; set; } = string.Empty ;

        public bool IsActive { get; set; }

        [ForeignKey("Admin")]
        public string? CreatedByAdminId { get; set; }

        [ForeignKey("Manager")]
        public string? ManagedByManagerId { get; set; }

        [ForeignKey("ParentPharmacy")]
        public int? ParentPharmacyID { get; set; }

      
        public Person? Admin { get; set; }
        public Person? Manager { get; set; }
        public Pharmacy? ParentPharmacy { get; set; }
        public ICollection<Medicine>? Medicines { get; set; }
    }
}
