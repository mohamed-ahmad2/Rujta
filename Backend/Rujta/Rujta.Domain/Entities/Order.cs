using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Order : BaseEntity
{
    // 🔹 Online order
    public Guid? UserID { get; set; }
    public virtual User? User { get; set; }

    // 🔹 Walk-in order
    public Guid? CustomerId { get; set; }
    public virtual Customer? Customer { get; set; }

    [ForeignKey("Pharmacy")]
    public int PharmacyID { get; set; }
    public virtual Pharmacy Pharmacy { get; set; }

    public int? PrescriptionID { get; set; }
    public virtual Prescription? Prescription { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public decimal TotalPrice { get; set; }

    public int? DeliveryAddressId { get; set; }
    public Address? DeliveryAddress { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    [Timestamp]
    public byte[] RowVersion { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; }
        = new List<OrderItem>();
}
