using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs.PaymentDto;

namespace Rujta.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentService> _logger;

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
            IConfiguration configuration,
            ILogger<PaymentService> logger)
        {
            _unitOfWork = unitOfWork;
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;

            _logger.LogInformation("[PaymentService] Initialized with BaseUrl: {BaseUrl}", BaseUrl);
        }

        public async Task<PaymentResponseDto> InitiateAsync(
            Guid userId, int pharmacyId,
            InitiatePaymentDto dto,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("[InitiateAsync] Started - UserId: {UserId}, PharmacyId: {PharmacyId}, Type: {Type}", userId, pharmacyId, dto.Type);

            ValidateDto(dto);

            var amountCents = dto.Amount * 100;
            _logger.LogInformation("[InitiateAsync] Amount in cents: {AmountCents}", amountCents);

            var authToken = await GetAuthTokenAsync();

            var paymobOrderId = await RegisterOrderAsync(authToken, amountCents, dto.Currency);

            var redirectUrl = dto.Type == PaymentType.Order ? UserRedirectUrl : AdminRedirectUrl;
            _logger.LogInformation("[InitiateAsync] Redirect URL selected: {RedirectUrl}", redirectUrl);

            var paymentKey = await GetPaymentKeyAsync(
                authToken, paymobOrderId, amountCents,
                dto.Currency, dto.BillingData, redirectUrl);

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

            await _unitOfWork.ExecuteInTransactionAsync(async ct =>
            {
                _logger.LogInformation("[InitiateAsync] Starting database transaction");

                await _unitOfWork.Payments.AddAsync(payment, ct);
                await _unitOfWork.SaveAsync(ct);

                _logger.LogInformation("[InitiateAsync] Payment saved - InternalPaymentId: {PaymentId}", payment.Id);

            }, cancellationToken);

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
            _logger.LogInformation("[HandleCallbackAsync] Callback received");

            if (!VerifyHmac(callback.Obj, hmacSignature))
            {
                _logger.LogWarning("[Callback] HMAC verification failed");
                return false;
            }

            if (!callback.Obj.Success)
            {
                _logger.LogInformation("[Callback] Payment not successful, skipping");
                return true;
            }

            var payment = await _unitOfWork.Payments
                .GetByPaymobOrderIdAsync(callback.Obj.Order.Id, cancellationToken);

            if (payment == null)
            {
                _logger.LogWarning("[Callback] Payment not found for OrderId={OrderId}", callback.Obj.Order.Id);
                return false;
            }

            if (payment.Status == PaymentStatus.Success)
            {
                _logger.LogInformation("[Callback] Already processed, skipping");
                return true;
            }

            await _unitOfWork.ExecuteInTransactionAsync(async ct =>
            {
                _logger.LogInformation("[HandleCallbackAsync] Updating payment");

                payment.Status = PaymentStatus.Success;
                payment.PaymobTransactionId = callback.Obj.Id;

                await _unitOfWork.Payments.UpdateAsync(payment, ct);
                await _unitOfWork.SaveAsync(ct);

                // ✅ Ad
                if (payment.Type == PaymentType.Ad && payment.AdId.HasValue)
                {
                    var ad = await _unitOfWork.Ads.GetByIdAsync(payment.AdId.Value, ct);

                    if (ad != null)
                    {
                        ad.IsActive = true;
                        ad.StartsAt = DateTime.UtcNow;
                        ad.ExpiresAt = DateTime.UtcNow.AddDays(ad.DurationDays);
                        ad.UpdatedAt = DateTime.UtcNow;

                        await _unitOfWork.Ads.UpdateAsync(ad, ct);
                        await _unitOfWork.SaveAsync(ct);

                        _logger.LogInformation("[Callback] Ad activated - AdId: {AdId}", ad.Id);
                    }
                }

                // ✅ Subscription
                if (payment.Type == PaymentType.Subscription && payment.SubscriptionId.HasValue)
                {
                    await _unitOfWork.Subscriptions.ActivateAsync(payment.PharmacyId, ct);

                    _logger.LogInformation("[Callback] Subscription activated - PharmacyId: {PharmacyId}", payment.PharmacyId);
                }

                // ✅ Order
                if (payment.Type == PaymentType.Order && payment.OrderId.HasValue)
                {
                    var order = await _unitOfWork.Orders.GetByIdAsync(payment.OrderId.Value, ct);

                    if (order != null)
                    {
                        order.PaymentStatus = PaymentStatus.Success;
                        order.PaymentMethod = PaymentMethod.Payment;

                        await _unitOfWork.Orders.UpdateAsync(order, ct);
                        await _unitOfWork.SaveAsync(ct);

                        _logger.LogInformation("[Callback] Order payment confirmed - OrderId: {OrderId}", order.Id);
                    }
                }

            }, cancellationToken);
            return true;
        }

        public async Task<IEnumerable<PaymentSummaryDto>> GetPharmacyPaymentsAsync(
            int pharmacyId, CancellationToken cancellationToken = default)
        {
            var payments = await _unitOfWork.Payments
                .GetByPharmacyIdAsync(pharmacyId, cancellationToken);

            _logger.LogInformation("[GetPharmacyPaymentsAsync] Found {Count} payments", payments.Count());

            return payments.Select(MapToSummary);
        }

        public async Task<IEnumerable<PaymentSummaryDto>> GetPharmacyPaymentsByTypeAsync(
            int pharmacyId, PaymentType type, CancellationToken cancellationToken = default)
        {
            var payments = await _unitOfWork.Payments
                .GetByPharmacyAndTypeAsync(pharmacyId, type, cancellationToken);

            _logger.LogInformation("[GetPharmacyPaymentsByTypeAsync] Found {Count} payments", payments.Count());

            return payments.Select(MapToSummary);
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
                $"{BaseUrl}/api/auth/tokens",
                new { api_key = ApiKey });

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return json.GetProperty("token").GetString()!;
        }

        private async Task<string> RegisterOrderAsync(
            string authToken, decimal amountCents, string currency)
        {
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

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return json.GetProperty("id").GetInt32().ToString();
        }

        private async Task<string> GetPaymentKeyAsync(
            string authToken, string paymobOrderId,
            decimal amountCents, string currency,
            PaymobBillingDataDto billing, string redirectUrl)
        {
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

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();
            return json.GetProperty("token").GetString()!;
        }

        private bool VerifyHmac(PaymobCallbackObj obj, string receivedHmac)
        {
            var data = string.Concat(
                ((long)obj.AmountCents).ToString(),
                obj.CreatedAt ?? string.Empty,
                obj.Currency ?? string.Empty,
                obj.ErrorOccured.ToString().ToLower(),
                obj.HasParentTransaction.ToString().ToLower(),
                obj.Id,
                obj.IntegrationId.ToString(),         
                obj.Is3dSecure.ToString().ToLower(),
                obj.IsAuth.ToString().ToLower(),
                obj.IsCapture.ToString().ToLower(),
                obj.IsRefunded.ToString().ToLower(),
                obj.IsStandalonePayment.ToString().ToLower(),
                obj.IsVoided.ToString().ToLower(),
                obj.Order.Id,
                obj.Owner?.ToString() ?? string.Empty,  
                obj.Pending.ToString().ToLower(),
                obj.SourceData.Pan ?? string.Empty,
                obj.SourceData.SubType ?? string.Empty,
                obj.SourceData.Type ?? string.Empty,
                obj.Success.ToString().ToLower()
            );

            _logger.LogWarning("[HMAC] Data: {Data}", data);
            _logger.LogWarning("[HMAC] Received: {Rec}", receivedHmac);

            using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(HmacSecret));
            var computed = Convert.ToHexString(
                hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLower();

            _logger.LogWarning("[HMAC] Computed: {Comp}", computed);

            return computed == receivedHmac.ToLower();
        }
    }
}