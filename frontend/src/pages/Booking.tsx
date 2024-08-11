import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import BookingForm from "../forms/BookingForm/BookingForm";
import { useSearchContext } from "../contexts/SearchContext";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingDetailsSummary from "../components/BookingDetailsSummary";
import { Elements } from "@stripe/react-stripe-js";
import { useAppContext } from "../contexts/AppContext";

const Booking = () => {
  const { stripePromise } = useAppContext();
  const search = useSearchContext();
  const { hotelId } = useParams();

  const [numberOfNights, setNumberOfNights] = useState<number>(0);

  useEffect(() => {
    if (search.checkIn && search.checkOut) {
      const nights =
        Math.abs(search.checkOut.getTime() - search.checkIn.getTime()) /
        (1000 * 60 * 60 * 24);

      setNumberOfNights(Math.ceil(nights));
    }
  }, [search.checkIn, search.checkOut]); //when we make checkin/checkout changes in the global state this re-runs and gets the new nos of nights based on new vals

  //we create paymentIntentData in the backend which calls stripe to create paymentIntent on stripe and returns us back a client secret which is ref to that paymentintent. so like a link back to the invoice 
  const { data: paymentIntentData } = useQuery(
    "createPaymentIntent",
    () =>
      apiClient.createPaymentIntent(
        hotelId as string,
        numberOfNights.toString()
      ),
    {
      //only call this query if we have hotelId and numberOfNights>0
      enabled: !!hotelId && numberOfNights > 0,
    }
  );

  //this query isnt gona run if we have hotelid var, good for perf as we not calling api many times 
  const { data: hotel } = useQuery(
    "fetchHotelByID",
    () => apiClient.fetchHotelById(hotelId as string),
    {
      enabled: !!hotelId,
    }
  );
  //fetching currUser endpoint using reactQuery
  const { data: currentUser } = useQuery(
    "fetchCurrentUser",
    apiClient.fetchCurrentUser
  );
  //to test this, we need to add a response type to func, caz when we add jsx stuff intellisence gives us proper type(we added in shared folder)
  // console.log(currentUser?.email); //just to see if this working
  if (!hotel) { //becaz hotelquery comes from query hook sometimes, it can be undefined. it can be solved by return empty react frag
    return <></>;
  }

  return (
    <div className="grid md:grid-cols-[1fr_2fr]">
      <BookingDetailsSummary
      //top lvl/parent component that handles all the states and does majority of data fetching here in one place we just passing to child components deping on what they need
        checkIn={search.checkIn}
        checkOut={search.checkOut}
        adultCount={search.adultCount}
        childCount={search.childCount}
        numberOfNights={numberOfNights}
        hotel={hotel} //becaz hotelquery comes from query hook sometimes, it can be undefined. it can be solved by return empty react frag
      />
      {currentUser && paymentIntentData && (
        // Elements comes from stripe frontend sdk and gives access to some ui els that lets user end some card details and lets us create a payment from the ui using sdk aswell  
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: paymentIntentData.clientSecret, //connecting stripe els on the front end to the invoice we just created, so whenever user creates a card payment strip will know what its for
          }}
        >
          <BookingForm
            currentUser={currentUser}
            paymentIntent={paymentIntentData}
          />
        </Elements>
      )}
    </div>
  );
};

export default Booking;
