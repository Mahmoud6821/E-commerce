import slugify from "slugify";
import { nanoid } from "nanoid";
// utils
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { cloudinaryConfig } from "../../Utils/cloudinary.utils.js";
// models
import { Category } from "../../../DB/Models/index.js";
import { SubCategory,Brand } from "../../../DB/Models/index.js";

/**
 * @POST /sub-categories/create  create sub-category
 */

export const createSubCategory = async (req, res, next) => {
  //check category Id
  const category = await Category.findById(req.query.categoryId);
  if (!category) {
    new ErrorClass("Category not found", 404, "Category Not Found");
  }
  //destructure request body
  const { name } = req.body;

  //create sub-category slug
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });

  //Image
  if (!req.file) {
    return next(
      new ErrorClass("Please upload an image", 400, "Please upload an image")
    );
  }
  //upload the image to cloudinary
  const customId = nanoid(4);

  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    {
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${category.customId}/Sub-Categories/${customId}`,
    }
  );
  console.log(public_id);

  const subCategoryObj = {
    name,
    slug,
    Image: {
      secure_url,
      public_id,
    },
    customId,
    categoryId: category._id,
  };

  const newSubCategory = await SubCategory.create(subCategoryObj);

  res.status(200).json({
    status: "success",
    message: "Sub-Category Created",
    data: newSubCategory,
  });
};
/**
 * @GET "/"  get all Sub-Catgeories
 */
export const getSubCategory = async (req, res, next) => {
  const { _id, name, slug } = req.query;
  const queryFilter = {};
  if (_id) queryFilter._id = _id;
  if (name) queryFilter.name = name;
  if (slug) queryFilter._slug = slug;

  console.log(queryFilter);
  const isFound = await SubCategory.findOne(queryFilter);

  if (!isFound) {
    next(
      new ErrorClass("Sub category not found", 404, "Sub Category Not found")
    );
  }

  res.status(200).json({
    status: "success",
    message: "Sub-Category Found",
    data: isFound,
  });
};

/**
 * @PUT "/update"  update sub-category
 */

export const updateSubCategory = async (req, res, next) => {
  //get sub ID
  const { _id } = req.params;
  // find subCategory by  id
  const subCategory = await SubCategory.findById(_id).populate("categoryId");
  if (!subCategory) {
    next(new ErrorClass("Sub-Category Not Found", 404, "Check your id"));
  }
  console.log(subCategory);

  // get data to update
  const { name } = req.body;
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });
  subCategory.name = name;
  subCategory.slug = slug;

  // updated Image
  if (req.file) {
    const splittedPublicId = subCategory.Image.public_id.split(
      `${subCategory.customId}/`
    )[1];


    const { secure_url } = await cloudinaryConfig().uploader.upload(
      req.file.path,
      {
        folder: `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/Sub-Categories/${subCategory.customId}`,
        public_id: splittedPublicId,
      }
    );

    subCategory.secure_url = secure_url;
  }

  const updatedSubcategory = await subCategory.save();
  res.status(200).json({
    status: "success",
    message: "Sub-Category Updated",
    data: updatedSubcategory,
  });
};


/**
 *@api {Delete} /sub-categories/delete/:_id
 */

 export const deleteSubCategory = async (req,res,next)=>{
  const { _id } = req.params;
  const subCategory = await SubCategory.findByIdAndDelete(_id).populate("categoryId");
  if (!subCategory) {
    return next(
      new ErrorClass("subCategory not found", 404, "subCategory not found")
    );
  }
  const subCategoryPath = `${process.env.UPLOADS_FOLDER}/Categories/${subCategory.categoryId.customId}/Sub-Categories/${subCategory.customId}`
  await cloudinaryConfig().api.delete_resources_by_prefix(subCategoryPath);
  await cloudinaryConfig().api.delete_folder(subCategoryPath);

  await Brand.deleteMany({subCategoryId:subCategory._id})

  return res.status(200).json({
    status:"success",
    message:"Sub-Category Deleted",
    data:subCategory
  })
 }