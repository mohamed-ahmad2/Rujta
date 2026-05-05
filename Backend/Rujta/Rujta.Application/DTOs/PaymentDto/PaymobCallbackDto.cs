namespace Rujta.Application.DTOs.PaymentDto
{
    public class PaymobCallbackDto
    {
        public string Type { get; set; } = string.Empty;
        public PaymobCallbackObj Obj { get; set; } = new();
    }

    public class PaymobCallbackObj
    {
        public string Id { get; set; } = string.Empty;
        public bool Success { get; set; }
        public bool IsPending { get; set; }
        public bool IsAuth { get; set; }
        public bool IsCapture { get; set; }
        public bool IsStandalonePayment { get; set; }
        public bool IsVoided { get; set; }
        public bool IsRefunded { get; set; }
        public bool Is3dSecure { get; set; }
        public bool ErrorOccured { get; set; }
        public bool HasParentTransaction { get; set; }
        public decimal AmountCents { get; set; }
        public int IntegrationId { get; set; }
        public string? CreatedAt { get; set; }
        public string? Currency { get; set; }
        public string? OwnerUsername { get; set; }
        public string? PendingAction { get; set; }
        public string? SourceDataPan { get; set; }
        public string? SourceDataSubType { get; set; }
        public string? SourceDataType { get; set; }
        public PaymobCallbackOrder Order { get; set; } = new();
    }

    public class PaymobCallbackOrder
    {
        public string Id { get; set; } = string.Empty;
        public decimal AmountCents { get; set; }
        public string Currency { get; set; } = string.Empty;
    }
}