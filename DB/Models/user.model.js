import mongoose from "../global-setup.js";
const { Schema, model } = mongoose;
import { hashSync } from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ["Buyer", "Admin"],
      default: "Buyer",
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    phone: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMarkedAsDeleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    }
  },
  {
    timeStamps: true,
  }
);

userSchema.pre("save", function (next) {
  console.log("==================Pre Hook==================");
  if (this.isModified("password")) {
    this.password = hashSync(this.password, +process.env.SALT_ROUNDS);
  }
  console.log(this);
  next();
});

userSchema.post("save", function (doc, next) {
  console.log("==================Post Hook==================");
  console.log(doc);
  next();
});
export const User = mongoose.model.User || model("User", userSchema);
