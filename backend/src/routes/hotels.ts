import express, { Request, Response } from "express";
import Hotel from "../models/hotel";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

const router = express.Router();
//here oreder of /search and /id imp if we put /id bfor then it error as it considers everything after / as id, but we have search para 
// api/hotels/search?(paras)
router.get("/search", async (req: Request, res: Response) => {
  try {

    //getting all hotels in our db and return to user, this is what an user will see when he navigates to search pages w/o any filters/search criteria

    //we adding pagination here, as if we have 1000s of hotels we dont wana return it on all search hit as its expensive on our server, if 100s of users accessing same endpoint at same time
    // when we call constructSearchQuery all the if statements are executed and assigned to query
    const query = constructSearchQuery(req.query);

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 }; //sort all the results from the query where star rating is high to low
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 }; //lowest to highest
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      //first we convert to str caz page's query paras can be str or str arr or other type(hover over it to check) 
      req.query.page ? req.query.page.toString() : "1"
    );
    //eg: pageNumber=3, (2)*5=10 are skipped
    const skip = (pageNumber - 1) * pageSize;

    //we skip pages and keep limit to pagesize(here 5), list of paginated hotels
    //when we create an api that has pagination, its good idea to pass pagination back to front-end to determine how many pages it can display, and total no. of pages...    
    const hotels = await Hotel.find(query) //order is imp here
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    //prints out in console to debug
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    // any t hotel gets added or edited then hoteltype gona store lastUpdated val as a  Date against that record, so we get the latest/updated hotels first 
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

// /api/hotels/923u3240uf
router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")], //express validator to validate query params
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel); //if hotel is empty it returns []
    } catch (error) {
      console.log(error); //debugging
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

//creating payment intent here(similar to invoice)
router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response) => { 
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;

    //hotelId
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(400).json({ message: "Hotel not found" });
    }

    //totalCost
    //we calc it in backend caz it gives most up to date price,
    //lets say user is on booking confirmation page and someone just updated the hotel in the background then the val on the front-end will be wrong, so to prevent someone from hacking the front end code and bring in their own pricePerNight bfor sent to backend. SO FOR DATA INTEGRITY AND SECURITY REASONS
    const totalCost = hotel.pricePerNight * numberOfNights;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100,
      currency: "usd",
      metadata: { //stripe lets us store whatever we want on this payment intent, we generally do this for analytics also helps to check if a booking had been paid for successfully bfor saved to db
        hotelId,
        userId: req.userId,
      },
    });

    // client secret need to be returned to front-end so user can create a card payment against this paymentIntent to pay for invoice
    if (!paymentIntent.client_secret) {
      return res.status(500).json({ message: "Error creating payment intent" });
    }

    //defining things we want to send to the front end
    const response = {
      paymentIntentId: paymentIntent.id, //to initialize some stripe els in the frontend
      clientSecret: paymentIntent.client_secret.toString(),
      totalCost,
    };

    res.send(response);
  }
);

router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const paymentIntentId = req.body.paymentIntentId;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId as string
      );

      if (!paymentIntent) {
        return res.status(400).json({ message: "payment intent not found" });
      }

      if (
        paymentIntent.metadata.hotelId !== req.params.hotelId ||
        paymentIntent.metadata.userId !== req.userId
      ) {
        return res.status(400).json({ message: "payment intent mismatch" });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: `payment intent not succeeded. Status: ${paymentIntent.status}`,
        });
      }

      const newBooking: BookingType = {
        ...req.body,
        userId: req.userId,
      };

      const hotel = await Hotel.findOneAndUpdate(
        { _id: req.params.hotelId }, //based on hotelid in the req
        {
          $push: { bookings: newBooking }, //and pushes the booking obj we created: newBooking, into the bookings arr of the hotel
        }
      );

      if (!hotel) {
        return res.status(400).json({ message: "hotel not found" });
      }

      await hotel.save();
      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  }
);

//add filters to constructserchquery func
const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }

  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }

  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  if (queryParams.facilities) {
    //finds all the hotels that has all the facilities that we received in query params
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities //if user selects one
        : [queryParams.facilities], //if user selects many(thus arr of strs)
    };
  }

  if (queryParams.types) {
    constructedQuery.type = {
      //a hotel can only have one type thus we use in
      //a user can select among many different types in a filter, return any hotels that have any of the types their type prop
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    //is array checked, if yes arr of strs converted to arr of nos
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars); //else if single star

    constructedQuery.starRating = { $in: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      //this gets all the hotels where price/night<=maxprice we recieve in our query params
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};

export default router;
