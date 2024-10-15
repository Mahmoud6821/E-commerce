import { Router } from "express";
import * as controller from "./order.controller.js";
import * as middlewares from "../../Middlewares/index.js";

const { errorHandler, authentication, authorization } = middlewares;
const orderRouter = Router();
orderRouter.post(
  "/place-order",
  authentication(),
  errorHandler(controller.createOrder)
);
orderRouter.put(
  "/cancel-order/:orderId",
  authentication(),
  errorHandler(controller.cancelOrder)
); 
orderRouter.put(
  "/deliverd-order/:orderId",
  authentication(),
  errorHandler(controller.deliverdOrder)
);

orderRouter.post(
  "/stripePay/:orderId",
  authentication(),
  errorHandler(controller.payWithStripe)
);
export { orderRouter };
