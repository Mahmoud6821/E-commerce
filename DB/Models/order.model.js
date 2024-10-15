import mongoose from "mongoose";
import { OrderStatus, PaymentMethods } from "../../src/Utils/index.js";
import { Product, Coupon } from "./index.js";
const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        title:{
          type:String,
          required:true,
          trim:true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    fromCart: {
      type: Boolean,
      default: true,
    },
    address: String,
    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    contactNumber: {
      type: Number,
      required: true,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    VAT: {
      type: Number,
      required: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    total: {
      type: Number,
      required: true,
    },
    estimatedDeliveryDate: {
      type: Date,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethods),
      default: PaymentMethods.Cash,
    },
    deliverdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deliveredAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

orderSchema.post("save", async function () {
  //decrment stock of product
  for (const product of this.products) {
    await Product.updateOne(
      { _id: product.productId },
      { $inc: { stock: -product.quantity } }
    );
  }
  //increment usage count of coupon
  if (this.couponId) {
    const coupon = await Coupon.findById(this.couponId);
    coupon.Users.find(c=>c.userId.toString()===this.userId.toString()).usageCount++ 
    await coupon.save();
  }
});
export const Order = mongoose.models.Order || model("Order", orderSchema);
