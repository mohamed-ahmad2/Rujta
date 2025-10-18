using Rujta.Domain.Common;
using Rujta.Domain.Enums;
using Rujta.Domain.Entities;
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

        public string DeliveryAddress { get; set; } = string.Empty;

        public OrderStatus Status { get; set; }


        //public required virtual User User { get; set; }
        public required virtual Pharmacy Pharmacy { get; set; }
        public virtual Prescription? Prescription { get; set; }
        public ICollection<OrderItem>? OrderItems { get; set; }
    }
}
