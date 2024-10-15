import express from "express";
import { config } from "dotenv";

import { globaleResponse } from "./src/Middlewares/index.js";
import db_connection from "./DB/connection.js";
import * as router from "./src/Modules/index.js";
import { disableCouponsCron } from "./src/Utils/index.js";
import { gracefulShutdown } from "node-schedule";
import { approveOrRejectReview } from "./src/Modules/Reviews/review.controller.js";

config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use("/categories", router.categoryRouter);
app.use("/sub-categories", router.subCategoryRouter);
app.use("/brands", router.brandRouter);
app.use("/products", router.productRouter);
app.use("/user", router.userRouter);
app.use("/address", router.addressRouter);
app.use("/cart", router.cartRouter);
app.use("/coupon", router.couponRouter);
app.use("/order",router.orderRouter);
app.use("/review",router.reviewRouter);

app.use('*',(req,res,next)=>{
    //next({message:"Not Found",cause:404});
    res.status(404).json({message:"Not Found"})
})
app.use('/',(req,res,next)=>{
    res.json({message:"Welcom to server page"});
})
app.use(globaleResponse);
db_connection();
disableCouponsCron();
gracefulShutdown();

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
