import Razorpay from "razorpay";
import crypto from "crypto";
import { AppError } from "../utils/appError.js";
import type { ICart } from "../interfaces/cartWishlistInterfaces.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export interface PaymentOrderData {
  amount: number; // Amount in paise (INR)
  currency: string;
  receipt: string;
  notes?: {
    userId: string;
    cartId?: string;
    courseIds?: string[];
  };
}

export interface PaymentVerificationData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Create a Razorpay payment order
 */
export const createPaymentOrder = async (
  data: PaymentOrderData,
): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> => {
  try {
    const options = {
      amount: data.amount,
      currency: data.currency || "INR",
      receipt: data.receipt,
      payment_capture: 1, // Auto-capture payment
      notes: data.notes || {},
    };

    const order = await razorpay.orders.create(options);

    return {
      orderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID as string,
    };
  } catch (error: any) {
    console.error("[createPaymentOrder]", error);
    throw new AppError(error.message || "Failed to create payment order", 400);
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = (
  data: PaymentVerificationData,
): boolean => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    // Generate signature using order_id and payment_id
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Compare generated signature with received signature
    return generatedSignature === razorpay_signature;
  } catch (error) {
    console.error("[verifyPaymentSignature]", error);
    return false;
  }
};

/**
 * Get cart total amount in paise
 */
export const getCartTotalInPaise = (cart: ICart): number => {
  const subtotal = cart.subtotal || 0;
  return Math.round(subtotal * 100); // Convert INR to paise
};

/**
 * Generate unique receipt ID
 */
export const generateReceiptId = (prefix: string = "receipt"): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);

  const suffix = `_${timestamp}_${random}`;
  const maxPrefixLength = 40 - suffix.length;

  const safePrefix = prefix.slice(0, Math.max(maxPrefixLength, 1));

  return `${safePrefix}${suffix}`;
};

export { razorpay };
