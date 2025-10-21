using Rujta.Domain.Enums;
using Rujta.Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
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
