using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public class Pharmacist : Person
    {
        public string Qualification { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
        public TimeSpan WorkStartTime { get; set; }
        public TimeSpan WorkEndTime { get; set; }

        public ICollection<ProcessPrescription>? ProcessPrescriptions { get; set; }
    }
}
