using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs.OrderDto;
using Rujta.Application.DTOs.PaymentDto;
using Rujta.Application.Interfaces.InterfaceServices.IOrder;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Rujta.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentService> _logger;
        private readonly IOrderService _orderService;   // ← مضاف لإنشاء الأوردر بعد الدفع

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
            ILogger<PaymentService> logger,
            IOrderService orderService)
        {
            _unitOfWork = unitOfWork;
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
            _orderService = orderService;

            _logger.LogInformation("[PaymentService] Initialized with BaseUrl: {BaseUrl}", BaseUrl);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // INITIATE: يُنشئ Paymob order + payment key ويحفظ Payment record في DB
        // الـ Order في نظامنا لم يُنشأ بعد — ينتظر نجاح الـ callback
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<PaymentResponseDto> InitiateAsync(
            Guid userId,
            int pharmacyId,
            InitiatePaymentDto dto,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation(
                "[InitiateAsync] Started - UserId: {UserId}, PharmacyId: {PharmacyId}, Type: {Type}",
                userId, pharmacyId, dto.Type);

            ValidateDto(dto);

            var amountCents = dto.Amount * 100;

            var authToken = await GetAuthTokenAsync();
            var paymobOrderId = await RegisterOrderAsync(authToken, amountCents, dto.Currency);
            var redirectUrl = dto.Type == PaymentType.Order ? UserRedirectUrl : AdminRedirectUrl;
            var paymentKey = await GetPaymentKeyAsync(
                authToken, paymobOrderId, amountCents,
                dto.Currency, dto.BillingData, redirectUrl);

            var payment = new Payment
            {
                UserId = userId,
                PharmacyId = pharmacyId,
                Type = dto.Type,
                OrderId = null,             // سيُربط بالأوردر بعد الـ callback
                SubscriptionId = dto.SubscriptionId,
                AdId = dto.AdId,
                PaymobOrderId = paymobOrderId,
                PaymentToken = paymentKey,
                Amount = dto.Amount,
                Currency = dto.Currency,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                // نحفظ CreateOrderDto عشان نستخدمه في الـ callback
                PendingOrderDtoJson = dto.PendingOrderDtoJson
            };

            await _unitOfWork.ExecuteInTransactionAsync(async ct =>
            {
                await _unitOfWork.Payments.AddAsync(payment, ct);
                await _unitOfWork.SaveAsync(ct);
                _logger.LogInformation(
                    "[InitiateAsync] Payment saved - InternalPaymentId: {PaymentId}", payment.Id);
            }, cancellationToken);

            return new PaymentResponseDto
            {
                InternalPaymentId = payment.Id,
                PaymentToken = paymentKey,
                IframeUrl = $"{BaseUrl}/api/acceptance/iframes/{IframeId}?payment_token={paymentKey}",
                PaymobOrderId = paymobOrderId
            };
        }

        // ─────────────────────────────────────────────────────────────────────────
        // CALLBACK: يُستدعى من Paymob webhook بعد إتمام الدفع
        // لو نجح الدفع → يُنشئ الأوردر في نظامنا
        // لو فشل → يُحدَّث Payment Status بـ Failed وينهي العملية
        // ─────────────────────────────────────────────────────────────────────────
        public async Task<bool> HandleCallbackAsync(
            PaymobCallbackDto callback,
            string hmacSignature,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("[HandleCallbackAsync] Callback received");

            // ── 1. التحقق من صحة الـ HMAC
            if (!VerifyHmac(callback.Obj, hmacSignature))
            {
                _logger.LogWarning("[Callback] HMAC verification failed");
                return false;
            }

            // ── 2. لو الدفع فاشل → نسجّل الفشل وننهي
            if (!callback.Obj.Success)
            {
                _logger.LogInformation("[Callback] Payment not successful");
                await HandleFailedPaymentAsync(callback.Obj.Order.Id, cancellationToken);
                return true;
            }

            // ── 3. نجيب الـ Payment record
            var payment = await _unitOfWork.Payments
                .GetByPaymobOrderIdAsync(callback.Obj.Order.Id, cancellationToken);

            if (payment == null)
            {
                _logger.LogWarning("[Callback] Payment not found for OrderId={OrderId}",
                    callback.Obj.Order.Id);
                return false;
            }

            // ── 4. Idempotency guard — لو اتعالج قبل كده نتجاهل
            if (payment.Status == PaymentStatus.Success)
            {
                _logger.LogInformation("[Callback] Already processed, skipping");
                return true;
            }

            // ── 5. نحدّث Payment record لـ Success
            await _unitOfWork.ExecuteInTransactionAsync(async ct =>
            {
                payment.Status = PaymentStatus.Success;
                payment.PaymobTransactionId = callback.Obj.Id;

                await _unitOfWork.Payments.UpdateAsync(payment, ct);
                await _unitOfWork.SaveAsync(ct);

                _logger.LogInformation(
                    "[Callback] Payment {PaymentId} marked as Success", payment.Id);

                // ── 6. لو النوع Ad → نفعّل الإعلان
                if (payment.Type == PaymentType.Ad && payment.AdId.HasValue)
                    await ActivateAdAsync(payment.AdId.Value, ct);

            }, cancellationToken);

            // ── 7. لو النوع Order → ننشئ الأوردر الآن
            if (payment.Type == PaymentType.Order)
                await CreateOrderAfterSuccessfulPaymentAsync(payment, cancellationToken);

            return true;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // REFUND: يُستدعى من OrderService عند الكانسل بعد دفع Paymob ناجح
        // ─────────────────────────────────────────────────────────────────────────
        public async Task RefundAsync(
            string paymobTransactionId,
            decimal amount,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation(
                "[RefundAsync] Initiating refund | TxId: {TxId} | Amount: {Amount}",
                paymobTransactionId, amount);

            var authToken = await GetAuthTokenAsync();

            var response = await _httpClient.PostAsJsonAsync(
                $"{BaseUrl}/api/acceptance/void_refund/refund",
                new
                {
                    auth_token = authToken,
                    transaction_id = paymobTransactionId,
                    amount_cents = (int)(amount * 100)
                });

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError(
                    "[RefundAsync] Refund request failed | Status: {Status} | Body: {Body}",
                    response.StatusCode, body);
                throw new InvalidOperationException(
                    $"Paymob refund failed for transaction {paymobTransactionId}.");
            }

            _logger.LogInformation(
                "[RefundAsync] Refund request accepted for TxId: {TxId}", paymobTransactionId);
        }

        // ─────────────────────────────────────────────────────────────────────────
        // Queries
        // ─────────────────────────────────────────────────────────────────────────
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

        // ─────────────────────────────────────────────────────────────────────────
        // Private helpers
        // ─────────────────────────────────────────────────────────────────────────

        /// <summary>
        /// ينشئ الأوردر في نظامنا بعد نجاح الدفع من Paymob
        /// </summary>
        private async Task CreateOrderAfterSuccessfulPaymentAsync(
            Payment payment,
            CancellationToken cancellationToken)
        {
            try
            {
                if (string.IsNullOrEmpty(payment.PendingOrderDtoJson))
                {
                    _logger.LogError(
                        "[Callback] PendingOrderDtoJson is null for Payment {PaymentId}. " +
                        "Cannot create order automatically.", payment.Id);
                    return;
                }

                var createOrderDto = System.Text.Json.JsonSerializer
                    .Deserialize<CreateOrderDto>(payment.PendingOrderDtoJson);

                if (createOrderDto == null)
                {
                    _logger.LogError(
                        "[Callback] Failed to deserialize PendingOrderDtoJson for Payment {PaymentId}.",
                        payment.Id);
                    return;
                }

                _logger.LogInformation(
                    "[Callback] Creating order after successful payment | PaymentId: {PaymentId}",
                    payment.Id);

                var orderDto = await _orderService.CreateOrderAfterPaymentAsync(
                    createOrderDto,
                    payment.UserId,
                    payment.Id,
                    cancellationToken);

                _logger.LogInformation(
                    "[Callback] Order {OrderId} created successfully after Paymob payment {PaymentId}",
                    orderDto.Id, payment.Id);
            }
            catch (Exception ex)
            {
                // نسجّل الخطأ — الـ payment نجح لكن إنشاء الأوردر فشل
                // يمكن معالجتها يدوياً أو عبر job
                _logger.LogError(ex,
                    "[Callback] CRITICAL: Payment {PaymentId} succeeded but order creation failed. " +
                    "Manual intervention required.", payment.Id);
            }
        }

        /// <summary>
        /// يُحدّث الـ Payment Status لـ Failed لو الـ callback جاي بفشل
        /// </summary>
        private async Task HandleFailedPaymentAsync(
            string paymobOrderId,
            CancellationToken cancellationToken)
        {
            try
            {
                var payment = await _unitOfWork.Payments
                    .GetByPaymobOrderIdAsync(paymobOrderId, cancellationToken);

                if (payment == null || payment.Status != PaymentStatus.Pending)
                    return;

                payment.Status = PaymentStatus.Failed;
                await _unitOfWork.Payments.UpdateAsync(payment, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogWarning(
                    "[Callback] Payment {PaymentId} marked as Failed for PaymobOrderId {OrderId}",
                    payment.Id, paymobOrderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "[Callback] Error while marking payment as failed for PaymobOrderId {OrderId}",
                    paymobOrderId);
            }
        }

        /// <summary>
        /// يُفعّل الإعلان بعد نجاح الدفع
        /// </summary>
        private async Task ActivateAdAsync(int adId, CancellationToken ct)
        {
            var ad = await _unitOfWork.Ads.GetByIdAsync(adId, ct);
            if (ad == null) return;

            ad.IsActive = true;
            ad.StartsAt = DateTime.UtcNow;
            ad.ExpiresAt = DateTime.UtcNow.AddDays(ad.DurationDays);
            ad.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Ads.UpdateAsync(ad, ct);
            await _unitOfWork.SaveAsync(ct);

            _logger.LogInformation("[Callback] Ad activated - AdId: {AdId}", ad.Id);
        }

        private static void ValidateDto(InitiatePaymentDto dto)
        {
            var isValid = dto.Type switch
            {
                PaymentType.Order => true,               // الأوردر يُنشأ بعد الدفع، لا نحتاج ID مسبقاً
                PaymentType.Subscription => dto.SubscriptionId.HasValue,
                PaymentType.Ad => dto.AdId.HasValue,
                _ => false
            };

            if (!isValid)
                throw new ArgumentException($"Missing reference ID for payment type {dto.Type}.");

            if (dto.Type == PaymentType.Order && string.IsNullOrEmpty(dto.PendingOrderDtoJson))
                throw new ArgumentException(
                    "PendingOrderDtoJson is required for Order payment type.");
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
            string authToken,
            string paymobOrderId,
            decimal amountCents,
            string currency,
            PaymobBillingDataDto billing,
            string redirectUrl)
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