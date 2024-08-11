import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import { HotelType } from "../shared/types";

const router = express.Router();

// /api/my-bookings
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    //searches all of hotel docs we have, checks bookings arr and returns all hotels that has userId as part of booking obj in the bookings arr
    const hotels = await Hotel.find({
      bookings: { $elemMatch: { userId: req.userId } },
    });

    const results = hotels.map((hotel) => {
      //only get the objs from booking arr where userId is our userId in our req
      const userBookings = hotel.bookings.filter(
        (booking) => booking.userId === req.userId
      );

      //update booking arr w this new userBookings arr
      const hotelWithUserBookings: HotelType = {
        ...hotel.toObject(), //converts mongoose hotel to js obj
        bookings: userBookings, //updating
      };

      return hotelWithUserBookings;
    });

    res.status(200).send(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

export default router;
