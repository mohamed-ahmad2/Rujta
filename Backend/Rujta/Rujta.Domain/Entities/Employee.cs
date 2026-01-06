using Rujta.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
{
    public class Employee : Person
    {
        public string Qualification { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
        public TimeSpan WorkStartTime { get; set; }
        public TimeSpan WorkEndTime { get; set; }

        [ForeignKey("Pharmacy")]
        public int? PharmacyId { get; set; }
        public virtual Pharmacy? Pharmacy { get; set; }

        public ICollection<ProcessPrescription>? ProcessPrescriptions { get; set; }

        [NotMapped]
        public object? ManagerData { get; set; }
    }
}
