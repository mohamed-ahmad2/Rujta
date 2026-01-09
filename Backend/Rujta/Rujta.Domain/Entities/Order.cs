using Rujta.Domain.Common;
using Rujta.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Domain.Entities
{
    public class Order : BaseEntity
    {
        [ForeignKey("User")]
        public Guid? UserId { get; set; }
        public virtual User? User { get; set; }

        [ForeignKey("Customer")]
        public Guid? CustomerId { get; set; }
        public virtual Customer? Customer { get; set; }

        [ForeignKey("Pharmacy")]
        public int PharmacyId { get; set; }
        public virtual Pharmacy Pharmacy { get; set; } = null!;

        [ForeignKey("Prescription")]
        public int? PrescriptionId { get; set; }
        public virtual Prescription? Prescription { get; set; }

        public string? DeliveryAddress { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public decimal TotalPrice { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        [Timestamp]
        public byte[] RowVersion { get; set; } = null!;

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
