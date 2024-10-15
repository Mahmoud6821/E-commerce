import Joi from "joi";
import mongoose from "mongoose";

const objectIdValidation = (value, helper) => {
  const isValid = mongoose.isValidObjectId(value);
  if(!isValid){
    return helper.message("Invalid object id")
  }
  return value;
};

export const generalRules = {
  _id: Joi.string().custom(objectIdValidation),
  headers: {
    "content-type": Joi.string(),
    accept: Joi.string().valid("application/json"),
    "accept-encoding": Joi.string(),
    host: Joi.string(),
    "content-length": Joi.string(),
    "user-agent": Joi.string(),
    "accept-language": Joi.string(),
    "accept-charset": Joi.string(),
    "postman-token": Joi.string(),
    "postman-id": Joi.string(),
  },
};
