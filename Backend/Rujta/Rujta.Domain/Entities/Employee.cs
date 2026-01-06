using Rujta.Domain.Entities;
using System.ComponentModel.DataAnnotations.Schema;

public class Employee : Person
{
    public string Qualification { get; set; } = string.Empty;
    public int ExperienceYears { get; set; }
    public TimeSpan WorkStartTime { get; set; }
    public TimeSpan WorkEndTime { get; set; }

    public int? PharmacyId { get; set; }
    public virtual Pharmacy? Pharmacy { get; set; }

    public ICollection<ProcessPrescription>? ProcessPrescriptions { get; set; }

    [NotMapped]
    public object? ManagerData { get; set; }
}
