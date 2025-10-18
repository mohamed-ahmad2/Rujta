namespace Rujta.Infrastructure.Identity.Entities
{
    public class Pharmacist : Person
    {
        public string Qualification { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
        public TimeSpan WorkStartTime { get; set; }
        public TimeSpan WorkEndTime { get; set; }
    }
}
