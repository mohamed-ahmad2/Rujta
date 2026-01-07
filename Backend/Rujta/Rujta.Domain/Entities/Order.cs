using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
{
    public class Order : BaseEntity
    {
        // 🔹 Either a User or a Customer can make the order
        [ForeignKey("User")]
        public Guid? UserId { get; set; }
        public virtual User? User { get; set; }

        [ForeignKey("Customer")]
        public Guid? CustomerId { get; set; }
        public virtual Customer? Customer { get; set; }

        // 🔹 Pharmacy linked to the order
        [ForeignKey("Pharmacy")]
        public int PharmacyId { get; set; }
        public virtual Pharmacy Pharmacy { get; set; } = null!;

        // 🔹 Optional prescription
        [ForeignKey("Prescription")]
        public int? PrescriptionId { get; set; }
        public virtual Prescription? Prescription { get; set; }

        // 🔹 Optional delivery address
        [ForeignKey("DeliveryAddress")]
        public int? DeliveryAddressId { get; set; }
        public virtual Address? DeliveryAddress { get; set; }

        // 🔹 Order date
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        // 🔹 Total price
        public decimal TotalPrice { get; set; }

        // 🔹 Order status
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        // 🔹 Concurrency token for safe updates
        [Timestamp]
        public byte[] RowVersion { get; set; } = null!;

        // 🔹 Order items
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
