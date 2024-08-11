import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";


//this says add usrid property to request type in express namespace
//this done to extend express req type
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  //first we do is get auth-token(which comes from our register req, whenever we create auth-token and http cookie) from cookie sent to us in req
  const token = req.cookies["auth_token"];
  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
    // if we dont add this to global, it gives error caz we adding a custom property to express req type, which doesnt have it
    //why we add userid to req is caz, when express forwards on the req to our own handler in auth.ts to validate-token endpoint, it means we are able to get access to it and send it back to front-end
    req.userId = (decoded as JwtPayload).userId; //userid is always stored in http cookie token
    next();
  } catch (error) {
    return res.status(401).json({ message: "unauthorized" });
  }
};

export default verifyToken;
