import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config"; //helps load env variables
import mongoose from "mongoose";
import userRoutes from "./routes/users";
import authRoutes from "./routes/auth";
import cookieParser from "cookie-parser";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import myHotelRoutes from "./routes/my-hotels";
import hotelRoutes from "./routes/hotels";
import bookingRoutes from "./routes/my-bookings";

//initializing our cloudinary, it will initialize our cloudinary server from back-end server
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//we pull as str here caz sometime whe we pull a value from environment it can be null/undefined
//there is a reason we put this line here caz if db connection fails it better fail; heere
mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
// .then(()=>
// console.log("connected to db: ", process.env.MONGODB_CONNECTION_STRING));
//uncomment above lines just for testing purpose

const app = express();
app.use(cookieParser()); 
app.use(express.json()); //helps convert body of api req to json
app.use(express.urlencoded({ extended: true })); // helps to parse the url
app.use(
  cors({ //security
    origin: process.env.FRONTEND_URL, //servern only going to accept req from this url 
    credentials: true, //that url must include http cookie in the req
    //if some bad actor gets the hold of cookies, they wont be able to access our servers caz url we trying to access from is different
  })
);

//go to "../../frontend/dist": has compiled front-end static assets, and serve those to the route of our url(on which backend runs on)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

//all reqs that aren't api req goes to index.ts(html) in front-end
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); //any reqs coming to our api w prefix of "/api/users" pass req to userroutes=> /api/users/register 
app.use("/api/my-hotels", myHotelRoutes); //my added hotels
app.use("/api/hotels", hotelRoutes); //all hotels added by all
app.use("/api/my-bookings", bookingRoutes);

//pass on any req to the url that not api endpoints, let react router dom package handle writing of this req for us,
//as some of our routes are begind addiotional logic, and it wont be part of static files we serve up above:express.static, as they gened at req time. as our addhotel route is behind conventional logic/protected route, it doesnt exist in static files we deploy at deploy time, code gets confused and thinks its an api route, so have ot request specificlly for reqs not api routes go to index.html of frone-end
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

//browser does get req by default
// app.get("/api/test", (req: Request, res: Response) => {
//   res.json({message: "hello this is express"});
// });

app.listen(7000, () => {
  console.log("server running on localhost:7000");
});
