using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Models
{
    public class InventoryItem
    {
        [Key]
        public int InventoryItemID { get; set; }

        [ForeignKey("Pharmacy")]
        public int PharmacyID { get; set; }

        [ForeignKey("Medicine")]
        public int MedicineID { get; set; }

        [ForeignKey("Prescription")]
        public int? PrescriptionID { get; set; }

        public int Quantity { get; set; }

        public DateTime ExpiryDate { get; set; }

        public decimal Price { get; set; }

        public bool IsDispensed { get; set; }

        public Pharmacy Pharmacy { get; set; } = new();
        public Medicine Medicine { get; set; } = new();
        public Prescription? Prescription { get; set; }
    }
}
