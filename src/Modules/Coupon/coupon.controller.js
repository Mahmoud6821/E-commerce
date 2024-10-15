import { Coupon, User, CouponChangeLog } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";

/**
 * @api {POST} /coupons/create  CREATE coupon
 */
export const createCoupon = async (req, res, next) => {
  const { couponCode, from, till, couponAmount, couponType, Users } = req.body;
  const userId = req.authUser._id;

  //coupon code check
  const doesCouponCodeExist = await Coupon.findOne({ couponCode });
  if (doesCouponCodeExist) {
    return next(
      new ErrorClass(
        "Coupon code already Exists",
        400,
        "Coupon code already Exists"
      )
    );
  }
  //check for users
  const userIds = Users.map((u) => u.userId);
  const validUsers = await User.find({ _id: { $in: userIds } });
  if (validUsers.length !== userIds.length) {
    return next(new ErrorClass("Invalid Users", 400, "Invalid Users"));
  }
  const newCoupon = new Coupon({
    couponCode,
    from,
    till,
    couponAmount,
    couponType,
    Users,
    addedBy: userId,
  });
  await newCoupon.save();
  res.status(201).json({ message: "Coupon created", newCoupon });
};
/**
 * @api {GET} coupon/ GET all coupons
 */
export const getCoupons = async (req, res, next) => {
  const { isEnabled } = req.query;
  const filters = {};
  if (isEnabled) {
    filters.isEnabled = isEnabled === "true" ? true : false;
  }
  const coupons = await Coupon.find(filters);
  res.status(200).json({ coupons });
};

export const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;
  console.log(couponId);

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(
      new ErrorClass("Coupon doesn't exist", 400, "Coupon doesn't exist")
    );
  }
  res.status(200).json({ coupon });
};

export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const userId = req.authUser._id;
  console.log(userId);

  const { couponCode, from, till, couponAmount, couponType, Users } = req.body;
  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    return next(
      new ErrorClass("Coupon does not exist", 404, "Coupon does not exist")
    );
  }
  const updatedObjectLog = { couponId, updatedBy: userId, changes: {} };

  if (couponCode) {
    const doesCouponCodeExist = await Coupon.findOne({ couponCode });
    if (doesCouponCodeExist) {
      return next(
        new ErrorClass(
          "Coupon code already Exists",
          400,
          "Coupon code already Exists"
        )
      );
    }
    coupon.couponCode = couponCode;
    updatedObjectLog.changes.couponCode = couponCode;
  }

  if (from) {
    coupon.from = from;
    updatedObjectLog.changes.from = from;
  }
  if (till) {
    coupon.till = till;
    updatedObjectLog.changes.till = till;
  }
  if (couponAmount) {
    coupon.couponAmount = couponAmount;
    updatedObjectLog.changes.couponAmount = couponAmount;
  }
  if (couponType) {
    coupon.couponType = couponType;
    updatedObjectLog.changes.couponType = couponType;
  }
  if (Users) {
    const userIds = Users.map((u) => u.userId);
    const validUsers = await User.find({ _id: { $in: userIds } });
    if (validUsers.length !== userIds.length) {
      return next(new ErrorClass("Invalid Users", 400, "Invalid Users"));
    }
    coupon.Users = Users;
    updatedObjectLog.changes.Users = Users;
  }

  await coupon.save();
  const updateLog = await new CouponChangeLog(updatedObjectLog).save();
  res.status(201).json({ message: "Coupon updated", coupon, updateLog });
};

export const disableEnableCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const userId = req.authUser._id;
  const { enable } = req.body;
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(
      new ErrorClass("Coupon does not exist", 404, "Coupon does not exist")
    );
  }
  const updateCouponlog = { couponId, updatedBy: userId, changes: {} };

  if (enable === true) {
    coupon.isEnabled = true;
    updateCouponlog.changes.isEnabled = true;
  }
  if (enable === false) {
    coupon.isEnabled = false;
    updateCouponlog.changes.isEnabled = false;
  }
  await coupon.save();
  const updateLog = await new CouponChangeLog(updateCouponlog).save();
  res.status(201).json({ message: "Coupon updated", coupon, updateLog });
};
