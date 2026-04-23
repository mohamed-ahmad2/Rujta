// Rujta.Domain/Entities/Payment.cs
using Rujta.Domain.Common;
using Rujta.Domain.Enums;

namespace Rujta.Domain.Entities
{
    public class Payment : BaseEntity
    {
        
        public Guid UserId { get; set; }          
        public int PharmacyId { get; set; }
        public PaymentType Type { get; set; }      

        public int? OrderId { get; set; }
        public int? SubscriptionId { get; set; }
        public int? AdId { get; set; }
        public string PaymobOrderId { get; set; } = string.Empty;
        public string PaymobTransactionId { get; set; } = string.Empty;
        public string PaymentToken { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "EGP";

        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}