import mongoose from "../global-setup.js";
const { Schema, model } = mongoose;

const categorySchema = new Schema(
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
    Images: {
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
categorySchema.post("findOneAndDelete", async function () {
  const _id = this.getQuery()._id;
  console.log(_id);

  const deleteSubCategory = await mongoose.models.SubCategory.deleteMany({
    categoryId: _id,
  });
  console.log("SubCategory deleted", deleteSubCategory);
  if (deleteSubCategory.deletedCount) {
    const deletedBrand = await mongoose.models.Brand.deleteMany({
      categoryId: _id,
    });
    console.log("Brand deleted", deletedBrand);
    if (deletedBrand.deletedCount) {
      const deletedProducts = await mongoose.models.Product.deleteMany({
        categoryId: _id,
      });
    console.log("Products deleted", deletedProducts);
      
    }
  }
});
export const Category =
  mongoose.models.Category || model("Category", categorySchema);
