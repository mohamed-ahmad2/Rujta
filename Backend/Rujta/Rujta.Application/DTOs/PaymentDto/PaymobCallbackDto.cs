using System.Text.Json.Serialization;

namespace Rujta.Application.DTOs.PaymentDto
{
    public class PaymobCallbackDto
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("obj")]
        public PaymobCallbackObj Obj { get; set; } = new();
    }

    public class PaymobCallbackObj
    {
        [JsonPropertyName("id")]
        [JsonConverter(typeof(IntToStringConverter))]  // ← add this
        public string Id { get; set; } = string.Empty;


        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("is_pending")]
        public bool IsPending { get; set; }

        [JsonPropertyName("is_auth")]
        public bool IsAuth { get; set; }

        [JsonPropertyName("is_capture")]
        public bool IsCapture { get; set; }

        [JsonPropertyName("is_standalone_payment")]
        public bool IsStandalonePayment { get; set; }

        [JsonPropertyName("is_voided")]
        public bool IsVoided { get; set; }

        [JsonPropertyName("is_refunded")]
        public bool IsRefunded { get; set; }

        [JsonPropertyName("is_3d_secure")]
        public bool Is3dSecure { get; set; }

        [JsonPropertyName("error_occured")]
        public bool ErrorOccured { get; set; }

        [JsonPropertyName("has_parent_transaction")]
        public bool HasParentTransaction { get; set; }

        [JsonPropertyName("amount_cents")]
        public decimal AmountCents { get; set; }

        [JsonPropertyName("integration_id")]
        public int IntegrationId { get; set; }

        [JsonPropertyName("created_at")]
        public string? CreatedAt { get; set; }

        [JsonPropertyName("currency")]
        public string? Currency { get; set; }

        [JsonPropertyName("owner")]
        public string? OwnerUsername { get; set; }

        [JsonPropertyName("pending")]
        public string? PendingAction { get; set; }

        [JsonPropertyName("source_data")]
        public PaymobSourceData SourceData { get; set; } = new();  // ✅ replaced 3 flat fields

        [JsonPropertyName("order")]
        public PaymobCallbackOrder Order { get; set; } = new();
    }

    public class PaymobCallbackOrder
    {
        [JsonPropertyName("id")]
    [JsonConverter(typeof(IntToStringConverter))]  // ← same here
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("amount_cents")]
        public decimal AmountCents { get; set; }

        [JsonPropertyName("currency")]
        public string Currency { get; set; } = string.Empty;
    }

    public class PaymobSourceData          // ✅ added here at the bottom
    {
        [JsonPropertyName("pan")]
        public string? Pan { get; set; }

        [JsonPropertyName("sub_type")]
        public string? SubType { get; set; }

        [JsonPropertyName("type")]
        public string? Type { get; set; }
    }
}