using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Models
{
    public enum SellStatus
    {
        Pending,
        Approved,
        Rejected,
        Completed
    }

    public class SellDrugViaPharmacy
    {
        [Key]
        public int SellID { get; set; }

        [ForeignKey("User")]
        public string SellerID { get; set; } = string.Empty;

        [ForeignKey("Pharmacy")]
        public int PharmacyID { get; set; }

        [ForeignKey("Medicine")]
        public int MedicineID { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }

        public DateTime ExpirationDate { get; set; }

        public string? ConditionNote { get; set; }

        public SellStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        public Person Seller { get; set; } = new();
        public Pharmacy Pharmacy { get; set; } = new();
        public Medicine Medicine { get; set; } = new();
    }
}
