import mongoose from "mongoose";
import { calculateCartTotal } from "../../src/Modules/Cart/cart.utils.js";
const { Schema, model } = mongoose;

const cartSchema = new Schema(
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
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        title:{
          type:String,
          required:true,
          trim:true,
        },
        price: {
          type: Number,
          required: false,
        },
      },
    ],
    subTotal: Number,
  },
  { timestamps: true }
);

cartSchema.pre("save", function (next) {
  this.subTotal = calculateCartTotal(this.products);
  console.log(`Calculatig subTotal before save ${this.subTotal}`);
  next();
});

cartSchema.post("save", async function (doc) {
  if (doc.products.length === 0) {
    console.log("Deleteing empty Cart");
    await Cart.deleteOne({ userId: doc.userId });
  }
});
export const Cart = mongoose.models.Cart || model("Cart", cartSchema);
