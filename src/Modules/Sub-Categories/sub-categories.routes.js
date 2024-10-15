import { Router } from "express";
// utils
import { extensions } from "../../Utils/index.js";
// middlewares
import * as middlewares from "../../Middlewares/index.js";
// models
import {SubCategory } from "../../../DB/Models/index.js";

import * as controller from "./sub-categories.controller.js";
// get the required middlewares
const { errorHandler, getDocumentByName, multerHost } = middlewares;

const subCategoryRouter = Router();

subCategoryRouter.post(
    "/create",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(SubCategory),
    errorHandler(controller.createSubCategory)
);
subCategoryRouter.put(
    "/update/:_id",
    multerHost({ allowedExtensions: extensions.Images }).single("image"),
    getDocumentByName(SubCategory),
    errorHandler(controller.upda)
);


subCategoryRouter.get("/",controller.getSubCategory)

subCategoryRouter.delete("/delete/:_id",controller.deleteSubCategory)

export { subCategoryRouter };