// Rujta.Application/DTOs/Payment/PaymentSummaryDto.cs
using Rujta.Domain.Enums;

namespace Rujta.Application.DTOs.PaymentDto
{
    public class PaymentSummaryDto
    {
        public int Id { get; set; }
        public PaymentType Type { get; set; }
        public string TypeLabel => Type.ToString();
        public int? OrderId { get; set; }
        public int? SubscriptionId { get; set; }
        public int? AdId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "EGP";
        public PaymentStatus Status { get; set; }
        public string StatusLabel => Status.ToString();
        public string PaymobTransactionId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}