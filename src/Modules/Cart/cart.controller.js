import { ErrorClass } from "../../Utils/index.js";
import { Cart, Product } from "../../../DB/Models/index.js";
import { checkProductStock } from "./cart.utils.js";

/**
 * @api {POST} /cart/add add product to cart
 *
 */

export const addToCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { quantity } = req.body;
  const { productId } = req.params;

  const product = await checkProductStock(productId, quantity);

  if (!product) {
    return next(new ErrorClass("Product not available", 404));
  }
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    const newCart = new Cart({
      userId,
      products: [
        {
          productId: product._id,
          title: product.title,
          quantity,
          price: product.appliedPrice,
        },
      ],
    });
    await newCart.save();
   return res.status(201).json({ message: "Product added to cart", cart: newCart });
  }
  //console.log(cart.products);
  
  const doesProductExist = cart.products.find((p) => p.productId == productId);
  
  if (doesProductExist) {
    return next(
      new ErrorClass("Product already in Cart", 400, "Product already in cart")
    );
  }
  console.log(product.title);

  cart.products.push({
    productId: product._id,
    quantity,
    title: product.title,
    price: product.appliedPrice,
  });

  await cart.save();
  res.status(200).json({ message: "Product added to cart", cart });
};

export const removeFromCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { productId } = req.params;

  const cart = await Cart.findOne({ userId, "products.productId": productId });

  if (!cart) {
    return next(
      new ErrorClass("Product not in Cart", 400, "Product not in cart")
    );
  }
  cart.products = cart.products.filter((p) => p.productId != productId);
  await cart.save();
  return res.status(200).json({ message: "Product removed from cart", cart });
};

export const updateCart = async (req, res, next) => {
  const userId = req.authUser._id;
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ userId, "products.productId": productId });
  if (!cart) {
    return next(
      new ErrorClass("Product not in Cart", 400, "Product not in cart")
    );
  }
  const product = await Product.findOne({
    _id: productId,
    stock: { $gte: quantity },
  });

  if (!product) {
    return next(new ErrorClass("Product not available", 404));
  }
  const productIndex = cart.products.findIndex(
    (p) => p.productId.toString() == product._id.toString()
  );
  console.log(productIndex);

  cart.products[productIndex].quantity = quantity;

  await cart.save();
  return res.status(200).json({ message: "Cart updated", cart });
};
