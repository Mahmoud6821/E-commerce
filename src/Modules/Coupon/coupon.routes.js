import { Router } from "express";
import * as controller from "./coupon.controller.js";
import * as middlewares from "../../Middlewares/index.js";
import { couponSchema, updateCouponSchema } from "./coupon.schema.js";
const { errorHandler, authentication, authorization, validation } = middlewares;

const couponRouter = Router();
//create coupon router
couponRouter.post(
  "/create-coupon",
  authentication(),
  validation(couponSchema),
  controller.createCoupon
);
couponRouter.get("/", errorHandler(controller.getCoupons));
couponRouter.get("/:couponId", errorHandler(controller.getCouponById));
couponRouter.put(
  "/update-coupon/:couponId",
  authentication(),
  validation(updateCouponSchema),
  errorHandler(controller.updateCoupon)
);
couponRouter.put(
  "/enable/:couponId",
  authentication(),
  validation(updateCouponSchema),
  errorHandler(controller.disableEnableCoupon)
);

export { couponRouter };
