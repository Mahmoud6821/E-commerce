import Stripe from "stripe";
import { Coupon } from "../../DB/Models/index.js";

export const createCheckOutSession = async ({
  customer_email,
  metadata,
  discounts,
  line_items,
}) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentData = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email,
    metadata,
    success_url: process.env.SUCCESS_URL,
    cancel_url: process.env.CANCEL_URL,
    discounts,
    line_items,
  });
  return paymentData;
};

//create a stripe coupon
export const createStripeCoupon = async ({ couponId }) => {
  
  const findCoupon = await Coupon.findById(couponId);
  if (!findCoupon) return res.stats(404).json({ message: "Coupon not found" });

  let couponObject = {};
  if (findCoupon.couponType=="Amount") {
    couponObject = {
      name: findCoupon.couponCode,
      amount_off: findCoupon.couponAmount*100,
      currency: "EGP",
    };
  }
  if (findCoupon.couponType==="Percentage") {
    couponObject = {
      name: findCoupon.couponCode,
      percent_Off: findCoupon.couponAmount,
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const stripeCoupon = await stripe.coupons.create( couponObject );
  return stripeCoupon;
};
