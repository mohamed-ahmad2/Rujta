using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
{
    public class Manager : Pharmacist
    {
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        [ForeignKey("Admin")]
        public Guid? AdminId { get; set; } 
        public Admin? Admin { get; set; }
    }
}
