// Rujta.Application/DTOs/Payment/InitiatePaymentDto.cs
using Rujta.Application.DTOs.OrderDto;
using Rujta.Domain.Enums;

namespace Rujta.Application.DTOs.PaymentDto
{
    public class InitiatePaymentDto
    {
        public PaymentType Type { get; set; }

        public int? SubscriptionId { get; set; }   
        public int? AdId { get; set; }   

        public decimal Amount { get; set; }
        public string Currency { get; set; } = "EGP";

        public PaymobBillingDataDto BillingData { get; set; } = new();

        public string? PendingOrderDtoJson { get; set; }
    }

    public class PaymentResponseDto
    {
        public string PaymentToken { get; set; } = string.Empty;
        public string IframeUrl { get; set; } = string.Empty;
        public string PaymobOrderId { get; set; } = string.Empty;
        public int InternalPaymentId { get; set; }
    }
}