import { Router } from "express";
// controllers
import * as controller from "./products.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
// utils
import { extensions } from "../../Utils/index.js";
// models
import { Brand } from "../../../DB/Models/index.js";

const { errorHandler, multerHost, checkIfIdsExist } = Middlewares;
const productRouter = Router();

productRouter.post(
  "/add",
  multerHost({ allowedExtensions: extensions.Images }).array("images", 5),
  checkIfIdsExist(Brand),
  errorHandler(controller.createProduct)
);

productRouter.put("/update/:productId", errorHandler(controller.updateProduct));
productRouter.get("/list", errorHandler(controller.listProducts));

export { productRouter };
