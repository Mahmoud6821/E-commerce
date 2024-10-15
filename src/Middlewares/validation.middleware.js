import { ErrorClass } from "../Utils/index.js";

const reqKeys = ["body", "query", "params", "headers","authUser"];

export const validation = (schema) => {
  return async (req, res, next) => {
    const validationErrors = [];
    for (const key of reqKeys) {
      // validate requests data against schema of the same key
      const validataionResult = schema[key]?.validate(req[key], {
        abortEarly: false,
      });
      if (validataionResult?.error) {
        validationErrors.push(validataionResult?.error?.details);
      }
    }
    // If there are validation errors, return the error response  with the validation errors
    console.log(validationErrors);
    validationErrors.length
      ? next(new ErrorClass("Validation Error", 400, validationErrors))
      : next();
  };
};
