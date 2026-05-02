using Rujta.Domain.Entities;
using System.ComponentModel.DataAnnotations.Schema;
namespace Rujta.Domain.Common
{
    public class Pharmacist : Employee
    {
        public string Position { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
        public decimal Salary { get; set; }

        public Guid ManagerId { get; set; }

        [ForeignKey(nameof(ManagerId))]
        public virtual Manager Manager { get; set; } = null!;
    }
}
