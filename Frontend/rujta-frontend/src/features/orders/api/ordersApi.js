// src/features/orders/api/ordersApi.js
import apiClient from "../../../shared/api/apiClient";

// ─── Admin / SuperAdmin ───────────────────────────────────────────────────────
// GET /api/orders  (SuperAdmin only)
export const getAllOrders = () => apiClient.get("/orders");

// ─── Single Order ─────────────────────────────────────────────────────────────
// GET /api/orders/:id
export const getOrderById = (id) => apiClient.get(`/orders/${id}`);

// GET /api/orders/:id/details  (includes OrderItems with MedicineName)
export const getOrderDetails = (id) => apiClient.get(`/orders/${id}/details`);

// ─── User Orders ──────────────────────────────────────────────────────────────
// GET /api/orders/user  → returns grouped OrderDto[][]
// Orders placed within 1 minute of each other are grouped together
export const getUserOrders = () => apiClient.get("/orders/user");

// ─── Pharmacy Orders ──────────────────────────────────────────────────────────
// GET /api/orders/pharmacy/orders  (PharmacyAdmin | Pharmacist)
export const getPharmacyOrders = () => apiClient.get("/orders/pharmacy/orders");

// ─── Create Cash Order ────────────────────────────────────────────────────────
// POST /api/orders
// Body: CreateOrderDto[]  — must NOT contain paymentMethod = "Payment"
// (Online payment orders go via POST /api/payments/initiate instead)
// CreateOrderDto: { pharmacyID, prescriptionID?, deliveryAddressId, paymentMethod:"Cash", orderItems:[{medicineID, quantity}] }
export const createOrder = (data) =>
  apiClient.post("/orders", Array.isArray(data) ? data : [data]);

// ─── CRUD ─────────────────────────────────────────────────────────────────────
export const updateOrder = (id, data) => apiClient.put(`/orders/${id}`, data);
export const deleteOrder = (id) => apiClient.delete(`/orders/${id}`);

// ─── Status Transitions (Pharmacy side) ──────────────────────────────────────
// PUT /api/orders/:id/accept         (Pending → Accepted)
export const acceptOrder = (id) => apiClient.put(`/orders/${id}/accept`, {});

// PUT /api/orders/:id/process        (Accepted → Processing)
export const processOrder = (id) => apiClient.put(`/orders/${id}/process`, {});

// PUT /api/orders/:id/out-for-delivery  (Processing → OutForDelivery)
export const outForDelivery = (id) =>
  apiClient.put(`/orders/${id}/out-for-delivery`, {});

// PUT /api/orders/:id/delivered      (OutForDelivery → Delivered)
// ⚠ Cash orders: PaymentStatus switches to Success here
// ⚠ Online orders: PaymentStatus was already Success after Paymob callback
export const markAsDelivered = (id) =>
  apiClient.put(`/orders/${id}/delivered`, {});

// ─── Cancel ───────────────────────────────────────────────────────────────────
// PUT /api/orders/:id/cancel/user    (User role; allowed when Pending or Accepted)
// If paid via Paymob → backend automatically initiates refund
export const cancelOrderByUser = (id) =>
  apiClient.put(`/orders/${id}/cancel/user`, {});

// PUT /api/orders/:id/cancel/pharmacy  (PharmacyAdmin | Pharmacist; Pending or Accepted)
// If paid via Paymob → backend automatically initiates refund
export const cancelOrderByPharmacy = (id) =>
  apiClient.put(`/orders/${id}/cancel/pharmacy`, {});
