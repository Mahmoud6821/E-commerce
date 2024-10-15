import { Order, Product, Review } from "../../../DB/Models/index.js";
import { OrderStatus, ErrorClass, ReviewStatus } from "../../Utils/index.js";

export const addReview = async (req, res, next) => {
  const { productId, reviewRating, reviewBody } = req.body;
  const userId = req.authUser._id;
  //check if product is already reviwed
  const isAlreadyReviewd = await Review.findOne({
    userId,
    productId,
  });
  if (isAlreadyReviewd) {
    return next(
      new ErrorClass(
        "You have already reviewed this product",
        400,
        "Already reviewed Product"
      )
    );
  }
  //check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorClass("Product not found", 404, "Product not found"));
  }
  // check if user boiught the product
  const isBought = await Order.findOne({
    userId,
    "products.productId": productId,
    orderStatus: OrderStatus.Delivered,
  });
  if (!isBought) {
    return next(
      new ErrorClass(
        "You must buy product first",
        404,
        "You must buy product first"
      )
    );
  }

  const reviewObject = {
    userId,
    productId,
    reviewRating,
    reviewBody,
  };
  const review = await Review.create(reviewObject);
  return res.status(201).json({ message: "Review added", review });
};

export const listReviews = async (req, res, next) => {
  const reviews = await Review.find().populate([
    {
      path: "userId",
      select: "username email -_id",
    },
    {
        path: "productId",
        select: "title rating ",
      },
  ]);
  return res.status(200).json({ reviews });
};
export const approveOrRejectReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { accept, reject } = req.body;
  if (accept && reject) {
    return next(
      new ErrorClass(
        "Please select either accept or reject",
        400,
        "Please select either accept or reject"
      )
    );
  }
  const review = await Review.findByIdAndUpdate(
    reviewId,
    {
      reviewStatus: accept
        ? ReviewStatus.Accepted
        : reject
        ? ReviewStatus.Rejected
        : ReviewStatus.Pending,
    },
    { new: true }
  );
  await review.save();
  return res.status(200).json({ message: "Review updated", review });
};
