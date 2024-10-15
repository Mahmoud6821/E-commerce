import { DateTime } from "luxon";
import { DiscountType } from "../../Utils/index.js";
import { Coupon } from "../../../DB/Models/index.js";

export const validateCoupon = async (couponCode, userId) => {
  //get coupon by coupon code
  const coupon = await Coupon.findOne({ couponCode });
  if (!coupon) {
    return { message: "Invalid coupon code", error: true };
  }

  //check if coupon is enabled
  if (!coupon.isEnabled || DateTime.now() > DateTime.fromJSDate(coupon.till)) {
    return { message: "Coupon is disabled", error: true };
  }

  //check if coupon not started yet
  if (DateTime.now() < DateTime.fromJSDate(coupon.from)) {
    return {
      message: `Coupon has not started yet, well start on ${coupon.from}`,
      error: true,
    };
  }
  console.log(coupon.Users);
  console.log(userId);

  //check if user not eligble to use coupon
  const isUserEligble = coupon.Users.some(
    (user) =>
      user.userId.toString() === userId.toString() ||
      (user.userId.toString() === userId.toString() &&
        user.maxUsage <= user.usageCount)
  );
  console.log(isUserEligble);

  if (!isUserEligble) {
    return { message: "You are not eligible to use this coupon", error: true };
  }
  return { error: false, coupon };
};

export const applyCoupon = (subTotal, coupon) => {
  let total = subTotal;
  const { couponAmount: discounAmount, couponType: discountType } = coupon;
  if (discounAmount && discountType) {
    if (discountType === DiscountType.Percentage) {
      total = subTotal - (subTotal * discounAmount) / 100;
    } else if (discountType === DiscountType.Fixed) {
      if (subTotal < discounAmount) {
        return total;
      }
      total = subTotal - discounAmount;
    }
  }
  return total;
};
