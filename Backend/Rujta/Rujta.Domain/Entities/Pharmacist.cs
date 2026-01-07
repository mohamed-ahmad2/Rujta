using Rujta.Domain.Entities;
namespace Rujta.Domain.Common
{
    public class Pharmacist : Employee
    {
        public string Position { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
        public decimal Salary { get; set; }

        public Guid ManagerId { get; set; }
        public virtual Manager Manager { get; set; } = null!;
    }
}
