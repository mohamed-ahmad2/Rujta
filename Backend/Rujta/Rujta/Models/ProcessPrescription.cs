using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Models
{
    public enum ProcessStatus
    {
        Approved,
        Rejected,
        InProgress
    }

    public class ProcessPrescription
    {
        [Key]
        public int ProcessPrescriptionID { get; set; }

        [ForeignKey("Pharmacist")]
        public string PharmacistID { get; set; } = string.Empty;

        [ForeignKey("Prescription")]
        public int PrescriptionID { get; set; }

        public DateTime DateProcessed { get; set; }

        public ProcessStatus Status { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public string? Comments { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        
        public Person Pharmacist { get; set; } = new();
        public Prescription Prescription { get; set; } = new();
    }
}
