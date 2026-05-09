// Rujta.Infrastructure/Services/PaymentService.cs
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Rujta.Application.DTOs.PaymentDto;

namespace Rujta.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        private string BaseUrl => _configuration["Paymob:BaseUrl"]!;
        private string ApiKey => _configuration["Paymob:ApiKey"]!;
        private int IntegrationId => int.Parse(_configuration["Paymob:IntegrationId"]!);
        private int IframeId => int.Parse(_configuration["Paymob:IframeId"]!);
        private string HmacSecret => _configuration["Paymob:HmacSecret"]!;
        private string UserRedirectUrl => _configuration["Paymob:UserRedirectUrl"]!;
        private string AdminRedirectUrl => _configuration["Paymob:AdminRedirectUrl"]!;

        public PaymentService(
            IUnitOfWork unitOfWork,
            HttpClient httpClient,
            IConfiguration configuration)
        {
            Console.WriteLine("[PaymentService] Constructor called");
            _unitOfWork = unitOfWork;
            _httpClient = httpClient;
            _configuration = configuration;
            Console.WriteLine($"[PaymentService] Initialized with BaseUrl: {BaseUrl}");
        }

        public async Task<PaymentResponseDto> InitiateAsync(
            Guid userId, int pharmacyId,
            InitiatePaymentDto dto,
            CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"[InitiateAsync] Started - UserId: {userId}, PharmacyId: {pharmacyId}, Type: {dto.Type}");

            ValidateDto(dto);
            Console.WriteLine("[InitiateAsync] DTO validation passed");

            var amountCents = dto.Amount * 100;
            Console.WriteLine($"[InitiateAsync] Amount in cents: {amountCents}");

            var authToken = await GetAuthTokenAsync();
            Console.WriteLine("[InitiateAsync] Auth token retrieved successfully");

            var paymobOrderId = await RegisterOrderAsync(authToken, amountCents, dto.Currency);
            Console.WriteLine($"[InitiateAsync] Order registered - PaymobOrderId: {paymobOrderId}");

            var redirectUrl = dto.Type == PaymentType.Order ? UserRedirectUrl : AdminRedirectUrl;
            Console.WriteLine($"[InitiateAsync] Redirect URL selected: {redirectUrl}");

            var paymentKey = await GetPaymentKeyAsync(
                authToken, paymobOrderId, amountCents,
                dto.Currency, dto.BillingData, redirectUrl);
            Console.WriteLine($"[InitiateAsync] Payment key retrieved: {paymentKey}");

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
            Console.WriteLine($"[InitiateAsync] Payment entity created with Internal Id (before save): {payment.Id}");

            await _unitOfWork.ExecuteInTransactionAsync(async ct =>
            {
                Console.WriteLine("[InitiateAsync] Starting database transaction");
                await _unitOfWork.Payments.AddAsync(payment, ct);
                Console.WriteLine("[InitiateAsync] Payment added to repository");
                await _unitOfWork.SaveAsync(ct);
                Console.WriteLine($"[InitiateAsync] Payment saved successfully - InternalPaymentId: {payment.Id}");
            }, cancellationToken);

            Console.WriteLine("[InitiateAsync] Transaction completed successfully");

            return new PaymentResponseDto
            {
                InternalPaymentId = payment.Id,
                PaymentToken = paymentKey,
                IframeUrl = $"{BaseUrl}/api/acceptance/iframes/{IframeId}?payment_token={paymentKey}",
                PaymobOrderId = paymobOrderId
            };
        }

        public async Task<bool> HandleCallbackAsync(
            PaymobCallbackDto callback,
            string hmacSignature,
            CancellationToken cancellationToken = default)
        {
            Console.WriteLine("[HandleCallbackAsync] Callback received");

            if (!VerifyHmac(callback.Obj, hmacSignature))
            {
                Console.WriteLine("[Callback] HMAC verification failed");
                return false;
            }
            Console.WriteLine("[HandleCallbackAsync] HMAC verification passed");

            if (!callback.Obj.Success)
            {
                Console.WriteLine("[Callback] Payment not successful, skipping");
                return true;
            }
            Console.WriteLine("[HandleCallbackAsync] Payment marked as successful by Paymob");

            var payment = await _unitOfWork.Payments
                .GetByPaymobOrderIdAsync(callback.Obj.Order.Id, cancellationToken);

            if (payment == null)
            {
                Console.WriteLine($"[Callback] Payment not found for OrderId={callback.Obj.Order.Id}");
                return false;
            }
            Console.WriteLine($"[HandleCallbackAsync] Payment found - InternalId: {payment.Id}, Status: {payment.Status}");

            if (payment.Status == PaymentStatus.Success)
            {
                Console.WriteLine($"[Callback] Already processed, skipping");
                return true;
            }

            await _unitOfWork.ExecuteInTransactionAsync(async ct =>
            {
                Console.WriteLine("[HandleCallbackAsync] Starting update transaction");

                payment.Status = PaymentStatus.Success;
                payment.PaymobTransactionId = callback.Obj.Id;
                Console.WriteLine($"[HandleCallbackAsync] Payment status updated to Success, TransactionId: {callback.Obj.Id}");

                await _unitOfWork.Payments.UpdateAsync(payment, ct);
                await _unitOfWork.SaveAsync(ct);
                Console.WriteLine($"[Callback] Payment {payment.Id} saved successfully");

                if (payment.Type == PaymentType.Ad && payment.AdId.HasValue)
                {
                    Console.WriteLine($"[HandleCallbackAsync] Processing Ad activation - AdId: {payment.AdId.Value}");
                    var ad = await _unitOfWork.Ads.GetByIdAsync(payment.AdId.Value, ct);

                    if (ad != null)
                    {
                        Console.WriteLine($"[Callback] Activating ad Id={ad.Id} for {ad.DurationDays} days");
                        ad.IsActive = true;
                        ad.StartsAt = DateTime.UtcNow;
                        ad.ExpiresAt = DateTime.UtcNow.AddDays(ad.DurationDays);
                        ad.UpdatedAt = DateTime.UtcNow;

                        await _unitOfWork.Ads.UpdateAsync(ad, ct);
                        await _unitOfWork.SaveAsync(ct);
                        Console.WriteLine($"[HandleCallbackAsync] Ad {ad.Id} activated successfully");
                    }
                    else
                    {
                        Console.WriteLine($"[Callback] Ad not found for AdId={payment.AdId.Value}");
                    }
                }
            }, cancellationToken);

            Console.WriteLine("[HandleCallbackAsync] Callback processing completed successfully");
            return true;
        }

        public async Task<IEnumerable<PaymentSummaryDto>> GetPharmacyPaymentsAsync(
            int pharmacyId, CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"[GetPharmacyPaymentsAsync] Fetching all payments for PharmacyId: {pharmacyId}");
            var payments = await _unitOfWork.Payments
                .GetByPharmacyIdAsync(pharmacyId, cancellationToken);
            Console.WriteLine($"[GetPharmacyPaymentsAsync] Found {payments.Count()} payments");
            return payments.Select(MapToSummary);
        }

        public async Task<IEnumerable<PaymentSummaryDto>> GetPharmacyPaymentsByTypeAsync(
            int pharmacyId, PaymentType type, CancellationToken cancellationToken = default)
        {
            Console.WriteLine($"[GetPharmacyPaymentsByTypeAsync] Fetching payments for PharmacyId: {pharmacyId}, Type: {type}");
            var payments = await _unitOfWork.Payments
                .GetByPharmacyAndTypeAsync(pharmacyId, type, cancellationToken);
            Console.WriteLine($"[GetPharmacyPaymentsByTypeAsync] Found {payments.Count()} payments");
            return payments.Select(MapToSummary);
        }

        private static void ValidateDto(InitiatePaymentDto dto)
        {
            Console.WriteLine($"[ValidateDto] Validating payment type: {dto.Type}");
            var isValid = dto.Type switch
            {
                PaymentType.Order => dto.OrderId.HasValue,
                PaymentType.Subscription => dto.SubscriptionId.HasValue,
                PaymentType.Ad => dto.AdId.HasValue,
                _ => false
            };
            if (!isValid)
            {
                Console.WriteLine($"[ValidateDto] Validation failed for type {dto.Type}");
                throw new ArgumentException($"Missing reference ID for payment type {dto.Type}.");
            }
            Console.WriteLine("[ValidateDto] Validation passed");
        }

        private static PaymentSummaryDto MapToSummary(Payment p)
        {
            Console.WriteLine($"[MapToSummary] Mapping payment Id: {p.Id}");
            return new()
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
        }

        private async Task<string> GetAuthTokenAsync()
        {
            Console.WriteLine("[GetAuthTokenAsync] Requesting auth token from Paymob");
            var response = await _httpClient.PostAsJsonAsync(
                $"{BaseUrl}/api/auth/tokens",
                new { api_key = ApiKey });

            response.EnsureSuccessStatusCode();
            Console.WriteLine("[GetAuthTokenAsync] Auth response successful");

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var token = json.GetProperty("token").GetString()!;
            Console.WriteLine("[GetAuthTokenAsync] Token retrieved successfully");
            return token;
        }

        private async Task<string> RegisterOrderAsync(
            string authToken, decimal amountCents, string currency)
        {
            Console.WriteLine($"[RegisterOrderAsync] Registering order - Amount: {amountCents}, Currency: {currency}");
            var response = await _httpClient.PostAsJsonAsync(
                $"{BaseUrl}/api/ecommerce/orders",
                new
                {
                    auth_token = authToken,
                    delivery_needed = false,
                    amount_cents = (int)amountCents,
                    currency,
                    items = Array.Empty<object>()
                });

            response.EnsureSuccessStatusCode();
            Console.WriteLine("[RegisterOrderAsync] Order registration successful");

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var orderId = json.GetProperty("id").GetInt32().ToString();
            Console.WriteLine($"[RegisterOrderAsync] Paymob OrderId: {orderId}");
            return orderId;
        }

        private async Task<string> GetPaymentKeyAsync(
            string authToken, string paymobOrderId,
            decimal amountCents, string currency,
            PaymobBillingDataDto billing, string redirectUrl)
        {
            Console.WriteLine($"[GetPaymentKeyAsync] Generating payment key for OrderId: {paymobOrderId}");

            var response = await _httpClient.PostAsJsonAsync(
                $"{BaseUrl}/api/acceptance/payment_keys",
                new
                {
                    auth_token = authToken,
                    amount_cents = (int)amountCents,
                    expiration = 3600,
                    order_id = paymobOrderId,
                    redirect_url = redirectUrl,
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
            Console.WriteLine("[GetPaymentKeyAsync] Payment key request successful");

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            var token = json.GetProperty("token").GetString()!;
            Console.WriteLine("[GetPaymentKeyAsync] Payment key generated successfully");
            return token;
        }

        private bool VerifyHmac(PaymobCallbackObj obj, string receivedHmac)
        {
            Console.WriteLine("[VerifyHmac] Starting HMAC verification");

            var amountCents = ((long)obj.AmountCents).ToString();
            var integrationId = obj.IntegrationId.ToString();

            var data = string.Concat(
                amountCents,
                obj.CreatedAt ?? string.Empty,
                obj.Currency ?? string.Empty,
                obj.ErrorOccured.ToString().ToLower(),
                obj.HasParentTransaction.ToString().ToLower(),
                obj.Id,
                integrationId,
                obj.Is3dSecure.ToString().ToLower(),
                obj.IsAuth.ToString().ToLower(),
                obj.IsCapture.ToString().ToLower(),
                obj.IsRefunded.ToString().ToLower(),
                obj.IsStandalonePayment.ToString().ToLower(),
                obj.IsVoided.ToString().ToLower(),
                obj.Order.Id,
                string.Empty,
                obj.Pending.ToString().ToLower(),
                obj.SourceData.Pan ?? string.Empty,
                obj.SourceData.SubType ?? string.Empty,
                obj.SourceData.Type ?? string.Empty,
                obj.Success.ToString().ToLower()
            );

            Console.WriteLine($"[HMAC Input] {data}");
            Console.WriteLine($"[HMAC Received] {receivedHmac}");

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(HmacSecret));
            var computed = Convert.ToHexString(
                hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLower();

            Console.WriteLine($"[HMAC Computed] {computed}");
            bool isValid = computed == receivedHmac.ToLower();
            Console.WriteLine($"[VerifyHmac] HMAC verification result: {isValid}");
            return isValid;
        }
    }
}