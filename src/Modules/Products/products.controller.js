import { nanoid } from "nanoid";
import mongoosePaginate from "mongoose-paginate-v2";
//models
import { Product } from "../../../DB/Models/index.js";
//utils
import {
  calculateProductPrice,
  ErrorClass,
  uploadFile,
  ApiFeatures,
  ReviewStatus,
} from "../../Utils/index.js";
import slugify from "slugify";

/**
 * @api {POST} /products/create create new product
 */
export const createProduct = async (req, res, next) => {
  // destructuring the request body
  const {
    title,
    overview,
    specs,
    badge,
    price,
    discountAmount,
    discountType,
    stock,
  } = req.body;

  //req.files
  if (!req.files.length) {
    return next(new ErrorClass("Please upload an image", { status: 400 }));
  }

  //Ids Check`
  const brandDocument = req.document;

  // Images section
  // Access the customIds from the brandDocument
  const brandCustomId = brandDocument.customId;
  const catgeoryCustomId = brandDocument.categoryId.customId;
  const subCategoryCustomId = brandDocument.subCategoryId.customId;

  const customId = nanoid(4);
  const folder = `${process.env.UPLOADS_FOLDER}/Categories/${catgeoryCustomId}/SubCategories/${subCategoryCustomId}/Brands/${brandCustomId}/Products/${customId}`;

  // upload each file to cloudinary
  const URLs = [];
  for (const file of req.files) {
    const { secure_url, public_id } = await uploadFile({
      file: file.path,
      folder,
    });
    URLs.push({ secure_url, public_id });
  }

  // prepare product object
  const productObject = {
    title,
    overview,
    specs: JSON.parse(specs),
    price,
    appliedDiscount: {
      amount: discountAmount,
      type: discountType,
    },
    stock,
    Images: {
      URLs,
      customId,
    },
    categoryId: brandDocument.categoryId._id,
    subCategoryId: brandDocument.subCategoryId._id,
    brandId: brandDocument._id,
  };

  // create in db
  const newProduct = await Product.create(productObject);
  // send the response
  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: newProduct,
  });
};

/**
 * @api {PUT} /products/update update product
 * @todo upload image with cloudinary
 */

export const updateProduct = async (req, res, next) => {
  //product id
  const { productId } = req.params;
  //destructuring the request body
  const {
    title,
    stock,
    overview,
    specs,
    badge,
    price,
    discountAmount,
    discountType,
  } = req.body;
  //check ifproduct exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorClass("Product not found", 404));
  }

  if (title) {
    product.title = title;
    product.slug = slugify(title, { replacement: "_", lower: true });
  }
  if (stock) product.stock = stock;
  if (overview) product.overview = overview;
  if (badge) product.badge = badge;
  if (price) {
    const newPrice = price || product.price;
    const discount = {};
    discount.amount = discountAmount || product.appliedDiscount.amount;
    discount.type = discountType || product.appliedDiscount.type;
    product.price = calculateProductPrice(newPrice, discount);
    product.appliedDiscount = discount;
  }
  // update the product specs
  /**
   * @todo when updating the Images field , you need to apply JSON.parse() method for specs before updating it in db
   */
  if (specs) product.specs = specs;
  //save
  await product.save();
  //send response
  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: product,
  });
};

/**
 * @api {GET} /products/get list all products
 */

export const listProducts = async (req, res, next) => {
  // const { page = 1, limit = 3, ...filters } = req.query;
  // //convert filter to string
  // const filterString = JSON.stringify(filters);
  // //adding $ sign before each filter using regular expression
  // const filterQuery = filterString.replace(
  //   /gte|gt|lte|lt/g,
  //   (match) => `$${match}`
  // );
  // const parsedFilter = JSON.parse(filterQuery);
  // const skip = (page - 1) * limit;
  // const products = await Product.paginate(parsedFilter, {
  //   page,
  //   limit,
  //   skip,
  //   select: "-Images --spescs -categoryId -subCategoryId -brandId",
  //   sort: { appliedPrice: 1 },
  // });
  const mongooseQuery = Product.find();
  console.log(req.query);
  
  const ApiFeaturesInstance = new ApiFeatures(Product, req.query, [
    { path: "Reviews", match: { reviewStatus: ReviewStatus.Accepted } },
  ])
    .pagination()
    .filters();
  console.log( ApiFeaturesInstance);
  const products = await ApiFeaturesInstance.mongooseQuery;
  // send the response
  res.status(200).json({
    status: "success",
    message: "Products list",
    data: products,
  });
};
