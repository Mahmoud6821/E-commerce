import mongoose from "mongoose";
const { Schema, model } = mongoose;
import { CouponTypes } from "../../src/Utils/index.js";

const couponSchema = new Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
    },
    couponAmount: {
      type: Number,
      required: true,
    },
    couponType: {
      type: String,
      required: true,
      enum: Object.values(CouponTypes),
    },
    from: {
      type: Date,
      required: true,
    },
    till: {
      type: Date,
      required: true,
    },
    Users: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        maxCount: {
          type: Number,
          required: true,
          min: 1,
        },
        usageCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    isEnabled: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Coupon = mongoose.models.Coupon || model("Coupon", couponSchema);

const couponChangeLogSchema = new Schema(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changes: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

export const CouponChangeLog =
  mongoose.models.CouponChangeLog ||
  model("CouponChangeLog", couponChangeLogSchema);
