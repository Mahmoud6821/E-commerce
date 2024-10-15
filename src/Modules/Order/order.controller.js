import { Cart, Address, Product } from "../../../DB/Models/index.js";
import { calculateCartTotal } from "../Cart/cart.utils.js";
import { ErrorClass, OrderStatus, PaymentMethods } from "../../Utils/index.js";
import { validateCoupon, applyCoupon } from "./order.utils.js";
import { Order } from "../../../DB/Models/order.model.js";
import { DateTime } from "luxon";
import {
  createCheckOutSession,
  createStripeCoupon,
} from "../../payment-handler/stripe.js";

export const createOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const {
    address,
    addressId,
    contactNumber,
    couponCode,
    shippingFee,
    VAT,
    paymentMethod,
  } = req.body;

  //find logged in user's cart with products
  const cart = await Cart.findOne({ userId }).populate([
    { path: "products.productId" },
    { path: "userId" },
  ]);
  //
  if (!cart) {
    return next(new ErrorClass("Empty Cart", 400, "Empty Cart"));
  }

  //check if products are sold out
  const isSoldOut = cart.products.find((p) => p.productId.stock < p.quantity);
  if (isSoldOut) {
    return next(
      new ErrorClass(
        `Product ${isSoldOut.productId.title} is sold out}`,
        400,
        "Product is sold out"
      )
    );
  }
  //calculate total order price
  const subTotal = calculateCartTotal(cart.products);
  let total = subTotal + shippingFee + VAT;
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await validateCoupon(couponCode, userId);
    if (isCouponValid.error) {
      return next(
        new ErrorClass(isCouponValid.message, 400, isCouponValid.message)
      );
    }
    coupon = isCouponValid.coupon;
    total = applyCoupon(subTotal, coupon);
  }
  if (!address && !addressId) {
    return next(
      new ErrorClass("Address is required", 400, "Address is required")
    );
  }
  if (addressId) {
    // check if address is valid
    const addressInfo = await Address.findOne({ _id: addressId, userId });
    if (!addressInfo) {
      return next(new ErrorClass("Invalid Address", 404, "Invalid Address"));
    }
  }
  let orderStatus = OrderStatus.Pending;
  if (paymentMethod === PaymentMethods.Cash) {
    orderStatus = OrderStatus.Placed;
  }

  const orderObj = new Order({
    userId,
    products: cart.products,
    address,
    addressId,
    contactNumber: cart.userId.phone || contactNumber,
    couponId: coupon?._id,
    shippingFee,
    VAT,
    paymentMethod,
    subTotal,
    total,
    orderStatus,
    estimatedDeliveryDate: DateTime.now()
      .plus({ days: 5 })
      .toFormat("yyyy-MM-dd"),
  });
  await orderObj.save();
  //clear cart
  cart.products = [];
  await cart.save();
  //decrement stock
  //increment usage counts

  res
    .status(201)
    .json({ status: "success", message: "Order Placed", data: orderObj });
};

/**
 * @api {PUT} /order/cancel-order cancel order
 */

export const cancelOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const { orderId } = req.params;
  //get order data
  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: {
      $in: [OrderStatus.Pending, OrderStatus.Placed, OrderStatus.Confrimed],
    },
  });
  if (!order) {
    return next(new ErrorClass("Order not found", 404, "Order not found"));
  }
  //check if order placed for more than 3 days
  const orderDate = DateTime.fromJSDate(order.createdAt);
  const currentDate = DateTime.now();
  const diffDays = Math.ceil(
    Number(currentDate.diff(orderDate, "days").toObject().days).toFixed(2)
  );
  console.log(diffDays);
  console.log(currentDate.diff(orderDate, "days").toObject());
  if (diffDays > 3) {
    return next(
      new ErrorClass(
        "Order cannot be cancelled after 3 days",
        400,
        "Order cannot be cancelled"
      )
    );
  }

  //upadte order status to be cancelled
  order.orderStatus = OrderStatus.Cancelled;
  order.cancelledBy = userId;
  order.cancelledAt = DateTime.now();
  await Order.updateOne({ _id: orderId }, order);
  //update product model
  for (const product of order.products) {
    console.log(product);
    await Product.updateOne(
      { _id: product.productId },
      { $inc: { stock: product.quantity } }
    );
  }

  res
    .status(200)
    .json({ status: "success", message: "Order Cancelled", data: order });
};

//===============Order delivery====================//
export const deliverdOrder = async (req, res, next) => {
  const userId = req.authUser._id;
  const { orderId } = req.params;
  //get order data
  const order = await Order.findOne({
    _id: orderId,
    userId,
    orderStatus: {
      $in: [OrderStatus.Placed, OrderStatus.Confrimed],
    },
  });
  if (!order) {
    return next(new ErrorClass("Order not found", 404, "Order not found"));
  }
  order.orderStatus = OrderStatus.Delivered;
  order.deliveredAt = DateTime.now();
  await Order.updateOne({ _id: orderId }, order);
  res
    .status(200)
    .json({ status: "success", message: "Order Delivered", data: order });
};

//to fix apiFeatures file video 3 week 15
export const listOrders = async (req, res, next) => {
  const userId = req.authUser._id;
};

//=======================order payment with stripe ========================//

export const payWithStripe = async (req, res, next) => {
  const { orderId } = req.params;
  const { userId } = req.authUser._id;
  //get order details from db
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
    orderStatus: "Pending",
  });

  if (!order) return next({ message: "Order not Found", cause: 404 });

  const paymentObject = {
    customer_Email: req.authUser.email,
    metadata: { orderId: orderId.toString() },
    discounts: [],
    line_items: order.products.map((item) => {
      return {
        price_data: {
          currency: "EGP",
          product_data: {
            name: item.title,
          },
          unit_amount: item.price * 100, //in cents
        },
        quantity: item.quantity,
      };
    }),
  };
  
  // coupon check
  if (order.couponId) {
    const stripeCoupon = await createStripeCoupon({ couponId: order.couponId });
    console.log(stripeCoupon);

    if (stripeCoupon.status) {
      return next({ message: stripeCoupon.message, cause: 400 });
    }
    paymentObject.discounts.push({ coupon: stripeCoupon.id });
  }

  const checkOutSession = await createCheckOutSession(paymentObject);
  res.status(200).json({ checkOutSession });
};
