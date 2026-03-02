using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System;

namespace Rujta.Application.Services
{/*
    public class PaymobService(
        IConfiguration _configuration,
        HttpClient _httpClient,
        AppDbContext _context
    ) : IPaymobService
    {
        public async Task<PaymobPaymentResult> CreatePaymentAsync(decimal amount)
        {
            try
            {
                var settings = _configuration.GetSection("Paymob");

                string apiKey = settings["ApiKey"]
                    ?? throw new InvalidOperationException("Paymob ApiKey missing.");

                string integrationIdStr = settings["IntegrationId"]
                    ?? throw new InvalidOperationException("IntegrationId missing.");

                string iframeId = settings["IframeId"]
                    ?? throw new InvalidOperationException("IframeId missing.");

                if (!int.TryParse(integrationIdStr, out int integrationId))
                    throw new InvalidOperationException("IntegrationId invalid.");

                string merchantOrderId = Guid.NewGuid().ToString();

                // 1️⃣ Auth
                var authResponse = await _httpClient.PostAsync(
                    "https://accept.paymob.com/api/auth/tokens",
                    new StringContent(
                        JsonSerializer.Serialize(new { api_key = apiKey }),
                        Encoding.UTF8,
                        "application/json"));

                authResponse.EnsureSuccessStatusCode();

                var authJson = JsonDocument.Parse(
                    await authResponse.Content.ReadAsStringAsync());

                string authToken = authJson.RootElement
                    .GetProperty("token").GetString()!;

                // 2️⃣ Create Order
                var orderResponse = await _httpClient.PostAsync(
                    "https://accept.paymob.com/api/ecommerce/orders",
                    new StringContent(JsonSerializer.Serialize(new
                    {
                        auth_token = authToken,
                        delivery_needed = "false",
                        amount_cents = (int)(amount * 100),
                        currency = "EGP",
                        merchant_order_id = merchantOrderId,
                        items = Array.Empty<object>()
                    }),
                    Encoding.UTF8,
                    "application/json"));

                orderResponse.EnsureSuccessStatusCode();

                var orderJson = JsonDocument.Parse(
                    await orderResponse.Content.ReadAsStringAsync());

                int paymobOrderId = orderJson.RootElement
                    .GetProperty("id").GetInt32();

                // 3️⃣ Payment Key
                var paymentResponse = await _httpClient.PostAsync(
                    "https://accept.paymob.com/api/acceptance/payment_keys",
                    new StringContent(JsonSerializer.Serialize(new
                    {
                        auth_token = authToken,
                        amount_cents = (int)(amount * 100),
                        expiration = 3600,
                        order_id = paymobOrderId,
                        billing_data = new
                        {
                            apartment = "NA",
                            email = "test@test.com",
                            floor = "NA",
                            first_name = "Customer",
                            street = "NA",
                            building = "NA",
                            phone_number = "01000000000",
                            shipping_method = "NA",
                            postal_code = "NA",
                            city = "Cairo",
                            country = "EG",
                            last_name = "User",
                            state = "NA"
                        },
                        currency = "EGP",
                        integration_id = integrationId
                    }),
                    Encoding.UTF8,
                    "application/json"));

                paymentResponse.EnsureSuccessStatusCode();

                var paymentJson = JsonDocument.Parse(
                    await paymentResponse.Content.ReadAsStringAsync());

                string paymentToken = paymentJson.RootElement
                    .GetProperty("token").GetString()!;

                // 💾 Save in DB
                var payment = new Payment
                {
                    MerchantOrderId = merchantOrderId,
                    PaymobOrderId = paymobOrderId,
                    Amount = amount,
                    Status = "Pending"
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                return new PaymobPaymentResult
                {
                    MerchantOrderId = merchantOrderId,
                    PaymobOrderId = paymobOrderId,
                    PaymentToken = paymentToken,
                    PaymentUrl =
                        $"https://accept.paymob.com/api/acceptance/iframes/{iframeId}?payment_token={paymentToken}"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("Paymob ERROR: " + ex);
                throw new InvalidOperationException("Paymob payment failed.", ex);
            }
        }

        public async Task HandleCallbackAsync(JsonElement data)
        {
            try
            {
                var obj = data.GetProperty("obj");

                int paymobOrderId = obj
                    .GetProperty("order")
                    .GetProperty("id")
                    .GetInt32();

                bool success = obj
                    .GetProperty("success")
                    .GetBoolean();

                var payment = await _context.Payments
                    .FirstOrDefaultAsync(p => p.PaymobOrderId == paymobOrderId);

                if (payment == null)
                    return;

                payment.Status = success ? "Paid" : "Failed";
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Callback ERROR: " + ex);
                throw;
            }
        }
    }
    */
}