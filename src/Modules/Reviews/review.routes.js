import { Router } from "express";
import * as controller from "./review.controller.js";
import * as middlewares from "../../Middlewares/index.js";
const { errorHandler, authentication, authorization } = middlewares;
const reviewRouter = Router();
reviewRouter.post(
  "/add-review",
  authentication(),
  errorHandler(controller.addReview)
);
reviewRouter.put(
  "/accept-review/:reviewId",
  errorHandler(controller.approveOrRejectReview)
);
export { reviewRouter };
