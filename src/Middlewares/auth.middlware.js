import jwt from "jsonwebtoken";
import {User} from "../../DB/Models/index.js";

export const authentication =  () => {
  return async(req, res, next) => {
    const { token } = req.headers;
    if (!token) {
      return res
        .status(400)
        .json({ message: "Please LogIn first, no token generated" });
    }
    //check for berar token
    if(!token.startsWith("ECOM")){
        return res
        .status(400)
        .json({ message: "Invalid token (berar)" });
    }

    const originalToken = token.split(" ")[1];

    //decode
    const decodedData = jwt.verify(originalToken,process.env.USER_TOKEN);
    if(!decodedData?.userId){
        return res
        .status(400)
        .json({ message: "Invalid Token Payload" });
    }
 
    //find UserID? for absloute data correctness
    const user = await User.findById(decodedData.userId).select("-password");
    if(!user){
        return res
        .status(400)
        .json({ message: "Please LogIn first" });
    }

    req.authUser = user;
    next();
  };
};
