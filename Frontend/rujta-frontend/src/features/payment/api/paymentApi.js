import apiClient from "../../../shared/api/apiClient";

/**
 * Initiate a payment (PharmacyAdmin only)
 * Backend: POST /api/payments/initiate
 * @param {Object} dto - InitiatePaymentDto
 * @param {string} dto.type        - "Order" | "Subscription" | "Ad"
 * @param {number} dto.amount
 * @param {string} dto.currency
 * @param {Object} dto.billingData
 * @param {number} [dto.orderId]
 * @param {number} [dto.subscriptionId]
 * @param {number} [dto.adId]
 */
export const initiatePayment = (dto) =>
  apiClient.post("/payments/initiate", dto);

/**
 * Handle Paymob callback (AllowAnonymous)
 * Backend: POST /api/payments/callback?hmac=...
 * @param {Object} dto   - PaymobCallbackDto
 * @param {string} hmac  - HMAC signature from query string
 */
export const handleCallback = (dto, hmac) =>
  apiClient.post("/payments/callback", dto, {
    params: { hmac },
  });

/**
 * Get all payments for the current pharmacy (Pharmacist)
 * Backend: GET /api/payments/my
 */
export const getMyPayments = () =>
  apiClient.get("/payments/my");

/**
 * Get order payments for the current pharmacy (Pharmacist)
 * Backend: GET /api/payments/my/orders
 */
export const getOrderPayments = () =>
  apiClient.get("/payments/my/orders");

/**
 * Get subscription payments for the current pharmacy (Pharmacist)
 * Backend: GET /api/payments/my/subscriptions
 */
export const getSubscriptionPayments = () =>
  apiClient.get("/payments/my/subscriptions");

/**
 * Get ad payments for the current pharmacy (PharmacyAdmin)
 * Backend: GET /api/payments/my/ads
 */
export const getAdPayments = () =>
  apiClient.get("/payments/my/ads");