using Rujta.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
{
    public class OrderItem : BaseEntity
    {
        [ForeignKey("Order")]
        public int OrderID { get; set; }

        [ForeignKey("Medicine")]
        public int MedicineID { get; set; }

        public int Quantity { get; set; }

        public decimal PricePerUnit { get; set; }

        public decimal SubTotal { get; set; }


        public required virtual Order Order { get; set; }
        public required virtual Medicine Medicine { get; set; } 
    }
}
