using Rujta.Domain.Enums;
using Rujta.Domain.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
{
    public class SellDrugViaPharmacy : BaseEntity
    {
        [ForeignKey(nameof(Seller))]
        public Guid SellerID { get; set; }

        [ForeignKey("Pharmacy")]
        public int PharmacyID { get; set; }

        [ForeignKey("Medicine")]
        public int MedicineID { get; set; }

        public int Quantity { get; set; }

        public decimal Price { get; set; }

        public DateTime ExpirationDate { get; set; }

        public string? ConditionNote { get; set; }

        public SellStatus Status { get; set; }


        public required virtual User Seller { get; set; }
        public required virtual Pharmacy Pharmacy { get; set; }
        public required virtual Medicine Medicine { get; set; }
    }
}
