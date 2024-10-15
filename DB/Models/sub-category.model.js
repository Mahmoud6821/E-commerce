import mongoose from "mongoose";
const { Schema, model } = mongoose;

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // TODO: Change to true after adding authentication
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      requird: true,
    },
    Image: {
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
    customId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

// post - delete hook
subCategorySchema.post("findOneAndDelete", async function () {
  const _id = this.getQuery()._id;
  console.log(_id);

    const deletedBrand = await mongoose.models.Brand.deleteMany({
      subCategoryId: _id,
    });
    console.log("Brand deleted", deletedBrand);
    if (deletedBrand.deletedCount) {
      const deletedProducts = await mongoose.models.Product.deleteMany({
        subCategoryId: _id,
      });
      console.log("Products deleted", deletedProducts);
    }
  
});
export const SubCategory =
  mongoose.models.SubCategory || model("SubCategory", subCategorySchema);
