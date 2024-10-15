import { Router } from "express";
import * as controller from "./cart.controller.js";
import * as middlewares from "../../Middlewares/index.js";
const{errorHandler,authentication} = middlewares;

const cartRouter = Router();
cartRouter.post("/add-to-cart/:productId",authentication(),errorHandler(controller.addToCart));
cartRouter.put("/remove-from-cart/:productId",authentication(),errorHandler(controller.removeFromCart));
cartRouter.put("/update-cart/:productId",authentication(),errorHandler(controller.updateCart));

export {cartRouter};