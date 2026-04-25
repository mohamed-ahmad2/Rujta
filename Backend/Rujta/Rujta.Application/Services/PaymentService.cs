// Rujta.Infrastructure/Services/PaymentService.cs
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Rujta.Application.DTOs.PaymentDto;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;

namespace Rujta.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        // to activate on success
        private readonly IAdRepository _adRepository;                     // to activate on success
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        private string ApiKey => _configuration["Paymob:ApiKey"]!;
        private int IntegrationId => int.Parse(_configuration["Paymob:IntegrationId"]!);
        private int IframeId => int.Parse(_configuration["Paymob:IframeId"]!);
        private string HmacSecret => _configuration["Paymob:HmacSecret"]!;

        public PaymentService(
            IPaymentRepository paymentRepository,
          
            IAdRepository adRepository,
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _paymentRepository = paymentRepository;
            
            _adRepository = adRepository;
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<PaymentResponseDto> InitiateAsync(
            Guid userId, int pharmacyId,
            InitiatePaymentDto dto,
            CancellationToken cancellationToken = default)
        {
            ValidateDto(dto);

            var amountCents = dto.Amount * 100;
            var authToken = await GetAuthTokenAsync();
            var paymobOrderId = await RegisterOrderAsync(authToken, amountCents, dto.Currency);
            var paymentKey = await GetPaymentKeyAsync(authToken, paymobOrderId, amountCents, dto.Currency, dto.BillingData);

            var payment = new Payment
            {
                UserId = userId,
                PharmacyId = pharmacyId,
                Type = dto.Type,
                OrderId = dto.OrderId,
                SubscriptionId = dto.SubscriptionId,
                AdId = dto.AdId,
                PaymobOrderId = paymobOrderId,
                PaymentToken = paymentKey,
                Amount = dto.Amount,
                Currency = dto.Currency,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _paymentRepository.AddAsync(payment, cancellationToken);

            return new PaymentResponseDto
            {
                InternalPaymentId = payment.Id,
                PaymentToken = paymentKey,
                IframeUrl = $"https://accept.paymob.com/api/acceptance/iframes/{IframeId}?payment_token={paymentKey}",
                PaymobOrderId = paymobOrderId
            };
        }

        public async Task<bool> HandleCallbackAsync(
            PaymobCallbackDto callback,
            string hmacSignature,
            CancellationToken cancellationToken = default)
        {
            if (!VerifyHmac(callback.Obj, hmacSignature))
                return false;

            var payment = await _paymentRepository
                .GetByPaymobOrderIdAsync(callback.Obj.Order.Id, cancellationToken);

            if (payment == null) return false;

            payment.Status = callback.Obj.Success ? PaymentStatus.Success : PaymentStatus.Failed;
            payment.PaymobTransactionId = callback.Obj.Id;
            payment.UpdatedAt = DateTime.UtcNow;

            await _paymentRepository.UpdateAsync(payment, cancellationToken);

            // Post-payment activation
            if (payment.Status == PaymentStatus.Success)
                await HandlePostPaymentAsync(payment, cancellationToken);

            return true;
        }

        public async Task<IEnumerable<PaymentSummaryDto>> GetPharmacyPaymentsAsync(
            int pharmacyId, CancellationToken cancellationToken = default)
        {
            var payments = await _paymentRepository.GetByPharmacyIdAsync(pharmacyId, cancellationToken);
            return payments.Select(MapToSummary);
        }

        public async Task<IEnumerable<PaymentSummaryDto>> GetPharmacyPaymentsByTypeAsync(
            int pharmacyId, PaymentType type, CancellationToken cancellationToken = default)
        {
            var payments = await _paymentRepository.GetByPharmacyAndTypeAsync(pharmacyId, type, cancellationToken);
            return payments.Select(MapToSummary);
        }

        // ─── Private Helpers ─────────────────────────────────────────────

        private async Task HandlePostPaymentAsync(Payment payment, CancellationToken cancellationToken)
        {
            switch (payment.Type)
            {
                

                case PaymentType.Ad when payment.AdId.HasValue:
                    await _adRepository.SetStatusAsync(payment.AdId.Value, true, cancellationToken);
                    break;

                case PaymentType.Order:
                    // Orders are handled by your order service — payment confirmation is enough
                    break;
            }
        }

        private static void ValidateDto(InitiatePaymentDto dto)
        {
            var isValid = dto.Type switch
            {
                PaymentType.Order => dto.OrderId.HasValue,
                PaymentType.Subscription => dto.SubscriptionId.HasValue,
                PaymentType.Ad => dto.AdId.HasValue,
                _ => false
            };

            if (!isValid)
                throw new ArgumentException($"Missing reference ID for payment type {dto.Type}.");
        }

        private static PaymentSummaryDto MapToSummary(Payment p) => new()
        {
            Id = p.Id,
            Type = p.Type,
            OrderId = p.OrderId,
            SubscriptionId = p.SubscriptionId,
            AdId = p.AdId,
            Amount = p.Amount,
            Currency = p.Currency,
            Status = p.Status,
            PaymobTransactionId = p.PaymobTransactionId,
            CreatedAt = p.CreatedAt
        };

        private async Task<string> GetAuthTokenAsync()
        {
            var response = await _httpClient.PostAsJsonAsync(
                "https://accept.paymob.com/api/auth/tokens",
                new { api_key = ApiKey });
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return json.GetProperty("token").GetString()!;
        }

        private async Task<string> RegisterOrderAsync(string authToken, decimal amountCents, string currency)
        {
            var response = await _httpClient.PostAsJsonAsync(
                "https://accept.paymob.com/api/ecommerce/orders",
                new
                {
                    auth_token = authToken,
                    delivery_needed = false,
                    amount_cents = (int)amountCents,
                    currency,
                    items = Array.Empty<object>()
                });
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return json.GetProperty("id").GetInt32().ToString();
        }

        private async Task<string> GetPaymentKeyAsync(
            string authToken, string paymobOrderId,
            decimal amountCents, string currency,
            PaymobBillingDataDto billing)
        {
            var response = await _httpClient.PostAsJsonAsync(
                "https://accept.paymob.com/api/acceptance/payment_keys",
                new
                {
                    auth_token = authToken,
                    amount_cents = (int)amountCents,
                    expiration = 3600,
                    order_id = paymobOrderId,
                    billing_data = new
                    {
                        first_name = billing.FirstName,
                        last_name = billing.LastName,
                        email = billing.Email,
                        phone_number = billing.PhoneNumber,
                        apartment = billing.Apartment,
                        floor = billing.Floor,
                        street = billing.Street,
                        building = billing.Building,
                        shipping_method = billing.ShippingMethod,
                        postal_code = billing.PostalCode,
                        city = billing.City,
                        country = billing.Country,
                        state = billing.State
                    },
                    currency,
                    integration_id = IntegrationId
                });
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return json.GetProperty("token").GetString()!;
        }

        private bool VerifyHmac(PaymobCallbackObj obj, string receivedHmac)
        {
            var data = string.Concat(
                obj.AmountCents, obj.CreatedAt, obj.Currency,
                obj.ErrorOccured.ToString().ToLower(),
                obj.HasParentTransaction.ToString().ToLower(),
                obj.Id, obj.IntegrationId,
                obj.Is3dSecure.ToString().ToLower(),
                obj.IsAuth.ToString().ToLower(),
                obj.IsCapture.ToString().ToLower(),
                obj.IsRefunded.ToString().ToLower(),
                obj.IsStandalonePayment.ToString().ToLower(),
                obj.IsVoided.ToString().ToLower(),
                obj.Order.Id, obj.OwnerUsername,
                obj.PendingAction, obj.SourceDataPan,
                obj.SourceDataSubType, obj.SourceDataType,
                obj.Success.ToString().ToLower()
            );

            using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(HmacSecret));
            var computed = Convert.ToHexString(
                hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLower();

            return computed == receivedHmac.ToLower();
        }
    }
}