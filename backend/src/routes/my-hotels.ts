//contains set of api endpoints that lets user create, update and view own hotels

import express, { Request, Response } from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import Hotel from "../models/hotel";
import verifyToken from "../middleware/auth";
import { body } from "express-validator";
import { HotelType } from "../shared/types";

const router = express.Router();

//multer picks bin img fields from form data in req to get and it will give it all as obj so we can handle it easier
const storage = multer.memoryStorage(); //store any file we get from push req in mem, as we not gona store them ourselves we gona upload them to cloudinary as soon as we get them. req is directly forwarded to cloudinarey, perf also increased
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

//we come to register set of routes w our express server: endpoint will be api/my-hotels, whenever we do post it will take us to the func "/"
//this is the endpoint our front-end will make req to whenever user submits the hotel form
//whenever we work w form w we send data as multi-part form obj
router.post(
  "/",
  verifyToken, //only logged in users can access this endpoint
  // name of form value field which gona hold images
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("type").notEmpty().withMessage("Hotel type is required"),
    body("pricePerNight")
      .notEmpty()
      .isNumeric()
      .withMessage("Price per night is required and must be a number"),
    body("facilities")
      .notEmpty()
      .isArray()
      .withMessage("Facilities are required"),
  ],
  upload.array("imageFiles", 6), //img files not need ot be added, as handled by multer
  // multer attaches files obj to req which we can use in our func
  async (req: Request, res: Response) => {
    try {
      const imageFiles = req.files as Express.Multer.File[]; //this will have img info and img files
      //our post reqs contains other data fields, as name, field... to get other fields
      const newHotel: HotelType = req.body; //form data still gets added to req body, we can acces the req as if its a json obj

      //upload imgs to cloudinary
      //if upload is success, add url to new hotel
      const imageUrls = await uploadImages(imageFiles);
      //we populated some of fields not all, so before saving to db we uploading rest of hotel obj
      newHotel.imageUrls = imageUrls;
      newHotel.lastUpdated = new Date();
      newHotel.userId = req.userId; //whenever browser sends a req it sends a http auth token cookie w it, its parsed and stored in req, reason we take auth token from cookie caz for security reasons, if we have a field in ui named userid, its easy to add and take care

      //save the hotel to our db
      const hotel = new Hotel(newHotel);
      await hotel.save();

      //201->created, when we create things it will make easier for front-end to any update it needs to do if we pass back the obj, its also confirmation for the clients that thing created successfully. but not always have to send (hotel) depends on our api
      res.status(201).send(hotel);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    //userid from the loggedin user that we get from http cookie token, which gets sent to us from the req
    const hotels = await Hotel.find({ userId: req.userId });
    res.json(hotels);
  } catch (error) {
    //this error is likely caused by db side
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  // eg: /api/my-hotels/8374389, id val is set to 8374389
  const id = req.params.id.toString();
  try {
    //here if find used instead of findOne we get an arr of hotels and our form isnt visible w pre-existing-data we had
    const hotel = await Hotel.findOne({
      _id: id,
      userId: req.userId, //we do this caz we dont want users to edit hotels which dont belong to them
      //userId gets added to req whenever verifyToken func runs, as token has userid in it
    });
    res.json(hotel); //if there's no hotel this gona be empty
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.put( //here we updating an entry, this is similar to creating new hotel
  "/:hotelId",
  verifyToken,
  //upload array we added to the signature of our endpoint so that multer w handle parsing and stuff for these files and add it to the req for us
  upload.array("imageFiles"),
  async (req: Request, res: Response) => {
    try {
      //getting hotel details, below type is of HotelType
      const updatedHotel: HotelType = req.body;
      updatedHotel.lastUpdated = new Date();

      //get the hotel we are updating and save the updated details to it
      const hotel = await Hotel.findOneAndUpdate(
        //it will find us hotel based on this criteria
        {
          _id: req.params.hotelId,
          userId: req.userId, //to get back only the hotels which belong to the user
        },
        // it will then update the property and merge it w the hotel just returned
        updatedHotel,
        // and new is set to true as hotel var we work w has most updated properties in it
        { new: true }
      );

      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const files = req.files as Express.Multer.File[]; //this is the new files user decides to add whenver he decides to edit it
      const updatedImageUrls = await uploadImages(files); //uploading files to cloudinary and it gives us back arr of the strs of those imgs 

      //adding this to our new hotel obj
      hotel.imageUrls = [
        ...updatedImageUrls, //making a copy of updatedImageUrls and spreading it to els of new arr
        ...(updatedHotel.imageUrls || []), //adding/removing the existing images based on user's choice
      ];

      await hotel.save();
      res.status(201).json(hotel);
    } catch (error) {
      res.status(500).json({ message: "Something went throw" });
    }
  }
);

async function uploadImages(imageFiles: Express.Multer.File[]) {
  //we can upload only one img at a time to cloudinary, so this logic to upload each induvidual img 
  const uploadPromises = imageFiles.map(async (image) => { //this is async so all the imgs are uploaded at once before reaching next code section after this func
    // encoding img to base 64 str
    const b64 = Buffer.from(image.buffer).toString("base64");
    let dataURI = "data:" + image.mimetype + ";base64," + b64;
    const res = await cloudinary.v2.uploader.upload(dataURI);
    return res.url;
  });

  const imageUrls = await Promise.all(uploadPromises);
  return imageUrls;
}

//registering this endpoint w express server
export default router;
