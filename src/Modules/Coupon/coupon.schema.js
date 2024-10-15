import Joi from "joi";
import { CouponTypes, generalRules } from "../../Utils/index.js";

export const couponSchema = {
    body: Joi.object({
        couponCode: Joi.string().required(),
        from: Joi.date().greater(Date.now()).required(),
        till: Joi.date().greater(Joi.ref('from')).required(),
        Users: Joi.array().items(Joi.object({
            userId: generalRules._id.required(),
            maxCount: Joi.number().min(1).required(),
        })),
        couponType: Joi.string().valid(...Object.values(CouponTypes)).required(),
        couponAmount: Joi.number().min(1).required().when('couponType', {
            is: CouponTypes.PERCENTAGE,
            then: Joi.number().max(100).required(),
        }).messages({
            'number.min': "Coupon amount must be greater than 0",
            'number.max': "Coupon amount must be less than 100",
        }),
    }),
};


export const updateCouponSchema={
    body: Joi.object({
        couponCode: Joi.string().optional(),
        from: Joi.date().greater(Date.now()).optional(),
        till: Joi.date().greater(Joi.ref('from')).optional(),
        Users: Joi.array().items(Joi.object({
            userId: generalRules._id.optional(),
            maxCount: Joi.number().min(1).optional(),
        })),
        couponType: Joi.string().valid(...Object.values(CouponTypes)).optional(),
        couponAmount: Joi.number().min(1).optional().when('couponType', {
            is: CouponTypes.PERCENTAGE,
            then: Joi.number().max(100).optional(),
        }).messages({
            'number.min': "Coupon amount must be greater than 0",
            'number.max': "Coupon amount must be less than 100",
        }),
    }),

    params:Joi.object({
        couponId:generalRules._id.required()
    }),
    /**
     * @FixError
     */
    // authUser:Joi.object({
    //     _id:generalRules._id.required()
    // }).options({allowUnknown:true})
}
