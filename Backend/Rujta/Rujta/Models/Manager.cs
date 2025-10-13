using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Models
{
    public class Manager : Pharmacist
    {
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        [ForeignKey("Admin")]
        public string? CreatedByAdminId { get; set; } 
        public Admin? Admin { get; set; }
    }
}
