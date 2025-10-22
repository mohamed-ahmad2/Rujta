using Rujta.Domain.Enums;
using Rujta.Domain.Common;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
{
    public class Prescription : BaseEntity
    {
        [ForeignKey("User")]
        public Guid PatientID { get; set; }

        public string DoctorName { get; set; } = string.Empty;

        public string? Diagnosis { get; set; }

        public DateTime DateIssued { get; set; }

        public string? PrescriptionImageURL { get; set; }

        public string? OCR_Text { get; set; }

        public PrescriptionStatus Status { get; set; }

        public string? Notes { get; set; }


        public required virtual User Patient { get; set; }
        public  ICollection<ProcessPrescription>? ProcessPrescriptions { get; set; }
        public ICollection<Order>? Orders { get; set; }
        public ICollection<InventoryItem>? InventoryItems { get; set; }
    }
}
