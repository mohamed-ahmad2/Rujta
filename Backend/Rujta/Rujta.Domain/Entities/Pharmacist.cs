using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
{
    public class Pharmacist : Employee
    {
        public string Position { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
        public decimal Salary { get; set; }

        [ForeignKey("Manager")]
        public Guid ManagerId { get; set; }
        public virtual Manager Manager { get; set; } = null!;
    }
}
