import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  getPaymentStatus,
  getPurchaseHistory,
  getInvoice,
} from "../controllers/paymentController.js";

const router = Router();


// ─── POST /api/payment/create-order ────────────────────────────────────────────
// Create a new Razorpay payment order
router.post("/create-order", createOrder);

// ─── POST /api/payment/verify ──────────────────────────────────────────────────
// Verify payment after successful checkout
router.post("/verify", verifyPayment);

// ─── GET /api/payment/status/:orderId ─────────────────────────────────────────
// Get payment status
router.get("/status/:orderId", getPaymentStatus);

// ─── GET /api/payment/purchase-history ─────────────────────────────────────────
// Get user's purchase history
router.get("/purchase-history", getPurchaseHistory);

// ─── GET /api/payment/invoice/:enrollmentId ────────────────────────────────────
// Get invoice for a specific purchase
router.get("/invoice/:enrollmentId", getInvoice);

export default router;
