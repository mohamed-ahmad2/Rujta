using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
{
    public class Manager : Employee
    {
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public Guid? AdminId { get; set; } 
        public Admin? Admin { get; set; }

        public ICollection<Pharmacist> Pharmacists { get; set; } = new List<Pharmacist>();
    }
}
