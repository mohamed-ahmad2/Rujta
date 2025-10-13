using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Models
{
    public enum OrderStatus
    {
        Pending,
        Ready,
        Delivered,
        Canceled
    }

    public class Order
    {
        [Key]
        public int OrderID { get; set; }

        [ForeignKey("User")]
        public string UserID { get; set; } = string.Empty;

        [ForeignKey("Pharmacy")]
        public int PharmacyID { get; set; }

        [ForeignKey("Prescription")]
        public int? PrescriptionID { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.Now;

        public decimal TotalPrice { get; set; }

        public string DeliveryAddress { get; set; } = string.Empty;

        public OrderStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }


        public Person User { get; set; } = new();
        public Pharmacy Pharmacy { get; set; } = new();
        public Prescription? Prescription { get; set; }
        public ICollection<OrderItem>? OrderItems { get; set; }
    }
}
