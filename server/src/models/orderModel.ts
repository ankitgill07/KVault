import mongoose, { Document, Schema, Model } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IOrder extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  instructor?: mongoose.Types.ObjectId;
  amount: number;
  status: "created" | "pending" | "paid" | "failed";
  razorpayOrderId?: string;
  paymentUrl?: string | null;
  transactionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const OrderSchema = new Schema<IOrder>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["created", "pending", "paid", "failed"],
      default: "created",
    },
    razorpayOrderId: {
      type: String,
    },
    paymentUrl: {
      type: String,
      default: null,
    },
    transactionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        if (ret) {
          delete (ret as any).__v;
        }
        return ret;
      },
    },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

OrderSchema.index({ student: 1, course: 1, status: 1 });

// ─── Model ────────────────────────────────────────────────────────────────────

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
