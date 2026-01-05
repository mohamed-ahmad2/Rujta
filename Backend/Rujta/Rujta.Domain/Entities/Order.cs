using Rujta.Domain.Common;
using Rujta.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Rujta.Domain.Entities
{
    public class Order : BaseEntity
    {
        [ForeignKey("User")]
        public Guid UserID { get; set; }

        [ForeignKey("Pharmacy")]
        public int PharmacyID { get; set; }

        [ForeignKey("Prescription")]
        public int? PrescriptionID { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.Now;

        public decimal TotalPrice { get; set; }

        [ForeignKey("DeliveryAddress")]
        public int? DeliveryAddressId { get; set; }
        
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Timestamp]
        public byte[]? RowVersion { get; set; }

        public Address? DeliveryAddress { get; set; }
        public virtual User User { get; set; } = null!;
        public virtual Pharmacy Pharmacy { get; set; } = null!;
        public virtual Prescription? Prescription { get; set; }
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
