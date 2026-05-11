// src/features/payment/api/paymentApi.js
import apiClient from "../../../shared/api/apiClient";

// ─── Initiate Payment (Online/Paymob only) ────────────────────────────────────
// Used for: PaymentType.Order (online), PaymentType.Subscription, PaymentType.Ad
// POST /api/payments/initiate
// Body: InitiatePaymentDto {
//   type: "Order"|"Subscription"|"Ad",
//   subscriptionId?: number,
//   adId?: number,
//   amount: number,
//   currency: string,           // default "EGP"
//   billingData: PaymobBillingDataDto,
//   pendingOrderDtoJson?: string  // required when type === "Order"
// }
// Returns: PaymentResponseDto { internalPaymentId, paymentToken, iframeUrl, paymobOrderId }
export const initiatePayment = (dto) =>
  apiClient.post("/payments/initiate", dto);

// ─── Cash Order ───────────────────────────────────────────────────────────────
// Used for: PaymentMethod.Cash orders only
// POST /api/orders  — body must be an array of CreateOrderDto
// CreateOrderDto: { pharmacyID, prescriptionID?, deliveryAddressId, paymentMethod: "Cash", orderItems: [{medicineID, quantity}] }
// Returns: OrderDto[]
// NOTE: PaymentStatus starts as Pending → becomes Success on Delivered
export const createCashOrder = (createOrderDto) =>
  apiClient.post("/orders", Array.isArray(createOrderDto) ? createOrderDto : [createOrderDto]);

// ─── Paymob Callback (rarely called from FE — usually server-to-server) ───────
// POST /api/payments/callback?hmac=<hmac>
export const handleCallback = (dto, hmac) =>
  apiClient.post("/payments/callback", dto, { params: { hmac } });

// ─── Pharmacy Payment Queries ─────────────────────────────────────────────────
// All require PharmacyAdmin or Pharmacist role

// GET /api/payments/my  → all payment types for this pharmacy
export const getMyPayments = () => apiClient.get("/payments/my");

// GET /api/payments/my/orders  → only Order payments
export const getOrderPayments = () => apiClient.get("/payments/my/orders");

// GET /api/payments/my/subscriptions  → only Subscription payments
export const getSubscriptionPayments = () => apiClient.get("/payments/my/subscriptions");

// GET /api/payments/my/ads  → only Ad payments (PharmacyAdmin only)
export const getAdPayments = () => apiClient.get("/payments/my/ads");