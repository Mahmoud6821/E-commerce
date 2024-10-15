import { Router } from "express";
//controllers
import * as controller from "./user.controller.js";
//middlewares
import * as Middlewares from "../../Middlewares/index.js";
import { authentication } from "../../Middlewares/auth.middlware.js";

const{errorHandler} = Middlewares;
const userRouter = Router();
userRouter.post("/register", errorHandler(controller.registerUser));
userRouter.patch("/update/:userId", errorHandler(controller.upadteAccount));
userRouter.get("/signIn", errorHandler(controller.signIn));

export { userRouter };