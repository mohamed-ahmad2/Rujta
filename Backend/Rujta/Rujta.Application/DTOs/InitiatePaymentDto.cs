// Rujta.Application/DTOs/Payment/InitiatePaymentDto.cs
using Rujta.Domain.Enums;

namespace Rujta.Application.DTOs.Payment
{
    /// <summary>
    /// Sent by the pharmacy to start any payment.
    /// Fill only the ID relevant to the Type.
    /// </summary>
    public class InitiatePaymentDto
    {
        public PaymentType Type { get; set; }

        public int? OrderId { get; set; }          // if Type == Order
        public int? SubscriptionId { get; set; }   // if Type == Subscription
        public int? AdId { get; set; }             // if Type == Ad

        public decimal Amount { get; set; }
        public string Currency { get; set; } = "EGP";
        public PaymobBillingDataDto BillingData { get; set; } = new();
    }

    public class PaymentResponseDto
    {
        public string PaymentToken { get; set; } = string.Empty;
        public string IframeUrl { get; set; } = string.Empty;
        public string PaymobOrderId { get; set; } = string.Empty;
        public int InternalPaymentId { get; set; }
    }
}