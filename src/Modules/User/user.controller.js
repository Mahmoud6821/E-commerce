/**
 * @api {POST} /users/create create new user
 */

import bcrypt from "bcryptjs";
const { hashSync,compareSync ,compare} = bcrypt;
import { User } from "../../../DB/Models/index.js";
import { ErrorClass } from "../../Utils/index.js";
import { Address } from "../../../DB/Models/index.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res, next) => {
  // destructuring the request body
  const {
    username,
    email,
    password,
    gender,
    age,
    phone,
    userType,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
  } = req.body;
  //email check
  const doesEmailExist = await User.findOne({ email });
  if (doesEmailExist) {
    return next(new ErrorClass("Email alreadty exists", 400));
  }
    //to -do send email verfications

  //create User Instance
  const userObject = new User({
    username,
    email,
    gender,
    password,
    age,
    phone,
    userType,
  });
  //create address instance
  const addressObject = new Address({
    userId: userObject._id,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    addressLabel,
    isDefault: true,
  });
  // create user in db
  const newUser = await userObject.save();
  const newAddress = await addressObject.save();
  res
    .status(201)
    .json({
      status: "success",
      message: "user created",
      data: newUser,
      newAddress,
    });
};

export const upadteAccount = async (req, res, next) => {
  const { userId } = req.params;
  const { username, password } = req.body;
  const user = await User.findById(userId);
  if (password) {
    user.password = password;
  }
  if (username) {
    user.username = username;
  }
  await user.save();
  res
    .status(200)
    .json({ status: "success", message: "user updated", data: user });
};
 
export const signIn = async (req, res, next) => {
  //get (email or phone) and password
  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });
  //check if user exists
  
  if (!user) {
    return res.status(404).json({ message: "Invalid Email or Mobile Number" });
  }
  //check valid credintals
  const isMatch = compareSync(password, user.password);
  console.log(password, user.password);
  
  console.log(isMatch);
  
  if (!isMatch) {
    return res.status(404).json({ message: "Invalid Password" });
  }
  //change user status
  user.status = "online";
  await user.save();

  const token = jwt.sign(
    { userId: user._id, status: user.status },
   process.env.USER_TOKEN,
    { expiresIn: "30d" }
  );
  res.status(200).json({ message: "User logged in", token });
};
