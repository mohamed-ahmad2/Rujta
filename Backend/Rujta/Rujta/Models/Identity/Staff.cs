using Rujta.Models.Entities;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Models.Identity
{
    public class Staff : Pharmacist
    {
        public string Position { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
        public decimal Salary { get; set; }

        [ForeignKey("Manager")]
        public Guid? ManagerID { get; set; }

        [ForeignKey("Pharmacy")]
        public int? PharmacyID { get; set; }


        public virtual Manager? Manager { get; set; }
        public virtual Pharmacy? Pharmacy { get; set; }
    }
}
