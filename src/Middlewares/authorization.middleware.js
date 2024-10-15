//import { ErrorClass } from "../../Utils/index.js";

export const authorization = (allowedUsers) => {
  return async (req, res, next) => {
    const user = req.authUser;
    console.log({ user, allowedUsers });
    if (!allowedUsers) {
      return next(
        new ErrorClass(
          "Authorization Error",
          401,
          "You are not allowed to access this route"
        )
      );
    }
    next();
  };
};
