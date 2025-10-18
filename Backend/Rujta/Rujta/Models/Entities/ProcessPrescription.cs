using Rujta.Enums;
using Rujta.Models.Common;
using Rujta.Models.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Models.Entities
{
    public class ProcessPrescription : BaseEntity
    {
        [ForeignKey("Pharmacist")]
        public Guid PharmacistID { get; set; }

        [ForeignKey("Prescription")]
        public int PrescriptionID { get; set; }

        public DateTime DateProcessed { get; set; }

        public ProcessStatus Status { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public string? Comments { get; set; }

        
        public required virtual Pharmacist Pharmacist { get; set; } 
        public required virtual Prescription Prescription { get; set; }
    }
}
