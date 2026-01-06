using Rujta.Domain.Common;
using Rujta.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;


namespace Rujta.Domain.Entities
{
    public class InventoryItem : BaseEntity
    {
        [ForeignKey("Pharmacy")]
        public int PharmacyID { get; set; }

        [ForeignKey("Medicine")]
        public int MedicineID { get; set; }

        [ForeignKey("Prescription")]
        public int? PrescriptionID { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }

        public ProductStatus Status { get; set; } = ProductStatus.InStock;

        public DateTime ExpiryDate { get; set; }

        public virtual Pharmacy? Pharmacy { get; set; }
        public virtual Medicine? Medicine { get; set; }
        public virtual Prescription? Prescription { get; set; }
    }
}
