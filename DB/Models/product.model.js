import slugify from "slugify";
//global setup
import mongoose from "../global-setup.js";
import {
  Badges,
  DiscountType,
  calculateProductPrice,
} from "../../src/Utils/index.js";
const { Schema, model } = mongoose;

const productSchema = new Schema(
  {
    //Strings Section
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowerCase: true,
      //create slug
      default: function () {
        return slugify(this.title, {
          replacement: "_",
          lower: true,
        });
      },
    },
    overView: String,
    specs: Object, //Map of Strings
    badges: {
      type: String,
      enum: Object.values(Badges),
    },
    //Number Section
    price: {
      type: Number,
      required: true,
      min: 50,
    },
    appliedDiscount: {
      amount: {
        type: Number,
        default: 0,
        min: 0,
      },
      type: {
        type: String,
        enum: Object.values(DiscountType),
        default: DiscountType.PERCENTAGE,
      },
    },
    appliedPrice: {
      type: Number,
      required: true,
      default: function () {
        return calculateProductPrice(this.price, this.appliedDiscount);
      },
    }, //price, pice-discount
    stock: {
      type: Number,
      required: true,
      min: 10,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    // Images Section
    Images: {
      URLs: [
        {
          secure_url: {
            type: String,
            required: true,
          },
          public_id: {
            type: String,
            required: true,
            unique: true,
          },
        },
      ],
      customId: {
        type: String,
        required: true,
        unique: true,
      },
    },

    // Ids sections
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true },toObject: { virtuals: true } }
);
productSchema.virtual('Reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId',
});
export const Product =
  mongoose.models.Product || model("Product", productSchema);
