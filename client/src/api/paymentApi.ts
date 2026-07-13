// src/api/paymentApi.ts
//
// Payment API — handles all HTTP communication with the server payment endpoints.
// This file is the single source of truth for payment API calls.

import { axiosInstance } from "./axoisInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Purchase {
  id: string;
  course: string;
  courseId?: string;
  thumbnailUrl?: string;
  date: string;
  amount: number;
  method: string;
  transactionId?: string;
  status: "Paid" | "Pending" | "Refunded";
  invoiceNumber: string;
  studentName?: string;
  studentEmail?: string;
  instructor?: {
    _id: string;
    name: string;
  };
}

export interface PurchaseHistoryResponse {
  success: boolean;
  message: string;
  data: Purchase[];
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceStatus: "PAID" | "PENDING" | "REFUNDED";
  
  student: {
    name: string;
    email: string;
    phone?: string;
  };
  
  course: {
    title: string;
    description: string;
    thumbnailUrl?: string;
  };
  
  instructor?: {
    name: string;
    email: string;
  };
  
  payment: {
    amount: number;
    currency: string;
    method: string;
    transactionId?: string;
    razorpayOrderId?: string;
    paymentDate: string;
    status: "SUCCESS" | "FAILED" | "PENDING";
  };
  
  enrollmentDate: string;
  validUntil: string | null;
}

export interface InvoiceResponse {
  success: boolean;
  message: string;
  data: InvoiceData;
}

export interface CreateOrderData {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: {
    userId: string;
    cartId?: string;
    courseIds?: string[];
  };
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  paymentId: string;
  orderId: string;
  enrolledCourses: string[];
}

// ─── Payment API ──────────────────────────────────────────────────────────────

export const paymentApi = {
  /**
   * POST /payment/create-order
   * Create a new Razorpay payment order
   */
  createOrder: async (data: CreateOrderData): Promise<CreateOrderResponse> => {
    const response = await axiosInstance.post("/payment/create-order", data);
    return response.data.data;
  },

  /**
   * POST /payment/verify
   * Verify payment after successful checkout
   */
  verifyPayment: async (data: VerifyPaymentData): Promise<VerifyPaymentResponse> => {
    const response = await axiosInstance.post("/payment/verify", data);
    return response.data.data;
  },

  /**
   * GET /payment/status/:orderId
   * Get payment status
   */
  getPaymentStatus: async (orderId: string): Promise<{ orderId: string; status: string }> => {
    const response = await axiosInstance.get(`/payment/status/${orderId}`);
    return response.data.data;
  },

  /**
   * GET /payment/purchase-history
   * Get user's purchase history
   */
  getPurchaseHistory: async (): Promise<Purchase[]> => {
    const response = await axiosInstance.get("/payment/purchase-history");
    return response.data.data;
  },

  /**
   * GET /payment/invoice/:enrollmentId
   * Get invoice for a specific purchase
   */
  getInvoice: async (enrollmentId: string): Promise<InvoiceData> => {
    const response = await axiosInstance.get(`/payment/invoice/${enrollmentId}`);
    return response.data.data;
  },
};
