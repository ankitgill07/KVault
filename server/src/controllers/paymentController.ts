import { type Request, type Response, type NextFunction } from "express";
import {
  createPaymentOrder,
  verifyPaymentSignature,
  getCartTotalInPaise,
  generateReceiptId,
} from "../services/paymentService.js";
import { sendSuccess, sendError } from "../utils/responseUtil.js";
import { type AuthenticatedRequest } from "../types/type.js";
import Cart from "../models/cartModel.js";
import Enrollment from "../models/enrollmentModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import { AppError } from "../utils/appError.js";
import { EnrollmentStatus } from "../interfaces/courseInterfaces.js";
import mongoose from "mongoose";

// ─── POST /api/payment/create-order ────────────────────────────────────────────

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    // Get user's cart
    const cart = await Cart.findOne({
      user: new mongoose.Types.ObjectId(userId),
    }).populate("items.course", "title price thumbnail");

    if (!cart || cart.items.length === 0) {
      sendError(res, "Your cart is empty", 400);
      return;
    }

    // Calculate total amount in paise
    const amountInPaise = getCartTotalInPaise(cart);

    if (amountInPaise <= 0) {
      sendError(res, "Invalid cart amount", 400);
      return;
    }

    // Generate receipt ID
    const receiptId = generateReceiptId(`order_${userId}`);

    // Extract course IDs
    const courseIds = cart.items
      .map(
        (item) =>
          (item.course as any)._id?.toString() || item.course.toString(),
      )
      .filter(Boolean);

    // Create payment order
    const order = await createPaymentOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        userId,
        cartId: cart._id.toString(),
        courseIds,
      },
    });

    sendSuccess(res, "Payment order created successfully", { order });
  } catch (error: any) {
    console.error("[createOrder]", error);
    sendError(res, error.message || "Failed to create payment order", 400);
  }
};

// ─── POST /api/payment/verify ──────────────────────────────────────────────────

export const verifyPayment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      sendError(res, "Missing payment verification details", 400);
      return;
    }

    // Verify payment signature
    const isSignatureValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isSignatureValid) {
      sendError(res, "Invalid payment signature", 400);
      return;
    }

    // Get cart with populated courses
    const cart = await Cart.findOne({
      user: new mongoose.Types.ObjectId(userId),
    }).populate("items.course");

    if (!cart || cart.items.length === 0) {
      sendError(res, "Cart not found or empty", 404);
      return;
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      sendError(res, "User not found", 404);
      return;
    }

    // Create enrollments for all courses in cart
    const enrolledCourses = new Set(user.enrolledCourses || []);

    // Initialize courseProgress as a plain object (Mongoose will convert to Map)
    const courseProgressObj: any = {};

    for (const item of cart.items) {
      const course = item.course as any;
      const courseId = course._id?.toString() || item.course.toString();

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        student: userId,
        course: courseId,
      });

      if (!existingEnrollment) {
        // Create enrollment with payment details
        await Enrollment.create({
          student: userId,
          course: courseId,
          progress: 0,
          amountPaid: course.price || item.priceAtAdd || 0,
          paymentMethod: "razorpay",
          transactionId: razorpay_payment_id,
          status: EnrollmentStatus.ACTIVE,
        });

        // Update course enrollment count
        await Course.findByIdAndUpdate(courseId, {
          $inc: { enrollmentCount: 1 },
        });
      }

      // Add to enrolled courses
      enrolledCourses.add(courseId);

      // Initialize progress if not exists
      if (!courseProgressObj[courseId]) {
        courseProgressObj[courseId] = {
          progress: 0,
          lastAccessed: "",
          completedLessons: [],
        };
      }
    }

    // Update user's enrolled courses and progress
    user.enrolledCourses = Array.from(enrolledCourses);
    user.courseProgress = courseProgressObj;
    user.markModified("courseProgress");
    await user.save();

    // Clear the cart
    await Cart.findOneAndDelete({ user: new mongoose.Types.ObjectId(userId) });

    sendSuccess(res, "Payment verified and courses enrolled successfully", {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      enrolledCourses: user.enrolledCourses,
    });
  } catch (error: any) {
    console.error("[verifyPayment]", error);
    sendError(res, error.message || "Payment verification failed", 400);
  }
};

// ─── GET /api/payment/status/:orderId ─────────────────────────────────────────

export const getPaymentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { orderId } = req.params;

    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    // In production, you might want to fetch payment status from Razorpay API
    // For now, we'll return a simple status
    sendSuccess(res, "Payment status retrieved", {
      orderId,
      status: "captured", // In production, fetch actual status from Razorpay
    });
  } catch (error: any) {
    console.error("[getPaymentStatus]", error);
    sendError(res, "Failed to get payment status", 400);
  }
};

// ─── GET /api/payment/purchase-history ─────────────────────────────────────────

export const getPurchaseHistory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    // Fetch all enrollments with course and payment details
    const enrollments = await Enrollment.find({ student: userId })
      .populate("course", "title thumbnail price instructor")
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    // Transform enrollments into purchase history format
    const purchaseHistory = enrollments.map((enrollment) => {
      const course = enrollment.course as any;
      const student = enrollment.student as any;

      return {
        id: enrollment._id.toString(),
        course: course?.title || "Unknown Course",
        courseId: course?._id?.toString(),
        thumbnail: course?.thumbnail,
        date: enrollment.createdAt,
        amount: enrollment.amountPaid || course?.price || 0,
        method: enrollment.paymentMethod || "razorpay",
        transactionId: enrollment.transactionId,
        status: "Paid", // All enrollments in this collection are paid
        invoiceNumber: `INV-${enrollment._id.toString().slice(-8).toUpperCase()}`,
        studentName: student?.name,
        studentEmail: student?.email,
        instructor: course?.instructor,
      };
    });

    sendSuccess(res, "Purchase history fetched successfully", purchaseHistory);
  } catch (error: any) {
    console.error("[getPurchaseHistory]", error);
    sendError(res, "Failed to fetch purchase history", 500);
  }
};

// ─── GET /api/payment/invoice/:enrollmentId ────────────────────────────────────

export const getInvoice = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { enrollmentId } = req.params;

    if (!userId) {
      sendError(res, "Unauthorized", 401);
      return;
    }
    if (
      !enrollmentId ||
      Array.isArray(enrollmentId) ||
      !mongoose.Types.ObjectId.isValid(enrollmentId)
    ) {
      throw new Error("Invalid enrollment ID");
    }
    // Fetch enrollment with all details
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      student: userId,
    })
      .populate("course", "title thumbnail price description instructor")
      .populate("student", "name email ")

    if (!enrollment) {
      sendError(res, "Enrollment not found", 404);
      return;
    }

    const course = enrollment.course as any;
    const student = enrollment.student as any;
    const instructor = course?.instructor;

    // Generate invoice data
    const invoiceData = {
      invoiceNumber: `INV-${enrollment._id.toString().slice(-8).toUpperCase()}`,
      invoiceDate: enrollment.createdAt,
      invoiceStatus: "PAID" as const,

      // Student Details
      student: {
        name: student?.name || "Student",
        email: student?.email || "",
        phone: student?.phone || "",
      },

      // Course Details
      course: {
        title: course?.title || "Course",
        description: course?.description || "",
        thumbnail: course?.thumbnail,
      },

      // Instructor Details
      instructor: instructor
        ? {
            name: instructor.name || "Instructor",
            email: instructor.email || "",
          }
        : null,

      // Payment Details
      payment: {
        amount: enrollment.amountPaid || course?.price || 0,
        currency: "INR",
        method: enrollment.paymentMethod || "razorpay",
        transactionId: enrollment.transactionId,
        razorpayOrderId: enrollment.transactionId, // You can store order ID separately if needed
        paymentDate: enrollment.createdAt,
        status: "SUCCESS" as const,
      },

      // Additional Info
      enrollmentDate: enrollment.createdAt,
      validUntil: null, // Lifetime access
    };

    sendSuccess(res, "Invoice fetched successfully", invoiceData);
  } catch (error: any) {
    console.error("[getInvoice]", error);
    sendError(res, "Failed to fetch invoice", 500);
  }
};
