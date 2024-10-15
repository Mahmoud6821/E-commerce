import { Router } from "express";
import * as controller from "./address.controller.js";
import * as middlewares from "../../Middlewares/index.js";
const{errorHandler,authentication} = middlewares;

const addressRouter = Router();

addressRouter.post("/addAddress",authentication(),errorHandler(controller.addAddress));
addressRouter.put("/updateAddress/:addressId",authentication(),errorHandler(controller.updateAddress));
addressRouter.put("/soft-delete/:addressId",authentication(),errorHandler(controller.softDeletaAddress)); 
addressRouter.get("/",authentication(),errorHandler(controller.getAllAddresses));  
export { addressRouter }