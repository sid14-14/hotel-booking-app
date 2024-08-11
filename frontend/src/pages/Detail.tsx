import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "./../api-client";
import { AiFillStar } from "react-icons/ai";
import GuestInfoForm from "../forms/GuestInfoForm/GuestInfoForm";

const Detail = () => {
  const { hotelId } = useParams();

  //react sometimes works tis way: it renders some times bfore the hook const { hotelId } is rendered, so hotelid might be undefined first render, so no point in callin api in that case
  //run this query if we havent gotten a hotelid
  const { data: hotel } = useQuery(
    "fetchHotelById",
    () => apiClient.fetchHotelById(hotelId || ""),
    {
      enabled: !!hotelId, //undefined=>false
    }
  );

  if (!hotel) { //becaz later re-renders happen, the jsx still works, as we referrence hotel obj in our jsx we dont want things to be undefined, so when all this stuff missing we return empty frag until hotel is ready
    return <></>;
  }

  return (
    <div className="space-y-6">
      <div>
        {/* we want all stars to appear horizontally */}
        <span className="flex">
          {Array.from({ length: hotel.starRating }).map(() => (
            <AiFillStar className="fill-yellow-400" />
          ))}
        </span>
        <h1 className="text-3xl font-bold">{hotel.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hotel.imageUrls.map((image) => (
          <div className="h-[300px]">
            <img
              src={image}
              alt={hotel.name}
              className="rounded-md w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        {hotel.facilities.map((facility) => (
          <div className="border border-slate-300 rounded-sm p-3">
            {facility}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
      {/* whitespace-pre-line: prevents overflow, and breaks the text upon a new space */}
        <div className="whitespace-pre-line">{hotel.description}</div>
        {/* h-fit: prevent this col from stretching w the left col(hotel.desc) and it will make its height match its content */}
        <div className="h-fit">
          <GuestInfoForm
            pricePerNight={hotel.pricePerNight}
            hotelId={hotel._id}
          />
        </div>
      </div>
    </div>
  );
};

export default Detail;
