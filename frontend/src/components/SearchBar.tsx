import { FormEvent, useState } from "react";
import { useSearchContext } from "../contexts/SearchContext";
import { MdTravelExplore } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const navigate = useNavigate();
  const search = useSearchContext(); //picking our search context we created in searchcontext(gloabal state)
  //get the search val if any exists in our context, then stored in localstate of the form-field as the user is typing as it causes entire app to re-render any t user changes any of the inputs, which will give perform overhead, so when user submits the form by clicking submit, we know they are finished at the fields of the form, thats when we save these local vals to the global state
  const [destination, setDestination] = useState<string>(search.destination);
  const [checkIn, setCheckIn] = useState<Date>(search.checkIn);
  const [checkOut, setCheckOut] = useState<Date>(search.checkOut);
  const [adultCount, setAdultCount] = useState<number>(search.adultCount);
  const [childCount, setChildCount] = useState<number>(search.childCount);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault(); // this prevents the form from automatically doing post req
    search.saveSearchValues( //save these local vals to the global state in search context
      destination,
      checkIn,
      checkOut,
      adultCount,
      childCount
    );
    //after it saves the val to the state, it pushes us to the /search page
    navigate("/search");
  };

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1); //maxdate is gona be one year from now

  return (
    // using react hook form
    <form
      onSubmit={handleSubmit}
      // -mt-8=> negative margin, so that searchbar overlaps container and header
      //grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5=> depending on screen size we have different nos of cols
      //items-center=> align items vertically 
      className="-mt-8 p-3 bg-orange-400 rounded shadow-md grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 items-center gap-4"
    >
      {/* flex-row=> our icon and input is aligned in a row */}
      {/* flex-1=> take up all available space */}
      <div className="flex flex-row items-center flex-1 bg-white p-2">
      {/* mr-2=> adds spacing to the right */}
        <MdTravelExplore size={25} className="mr-2" />
        <input
          placeholder="Where are you going?"
          // w-full=> take up full width
          className="text-md w-full focus:outline-none"
          value={destination}
          onChange={(event) => setDestination(event.target.value)} //sets destination any-t this input changes
        />
      </div>

      <div className="flex bg-white px-2 py-1 gap-2">
        <label className="items-center flex">
          Adults:
          <input
            className="w-full p-1 focus:outline-none font-bold"
            type="number"
            min={1}
            max={20}
            value={adultCount}
            onChange={(event) => setAdultCount(parseInt(event.target.value))}
          />
        </label>
        <label className="items-center flex">
          Children:
          <input
            className="w-full p-1 focus:outline-none font-bold"
            type="number"
            min={0}
            max={20}
            value={childCount}
            onChange={(event) => setChildCount(parseInt(event.target.value))}
          />
        </label>
      </div>
      <div>
        <DatePicker
          selected={checkIn} //pre-selects date of check val
          onChange={(date) => setCheckIn(date as Date)}
          selectsStart //as we working in ranges, this means select first date specified in startstate
          startDate={checkIn}
          endDate={checkOut}
          minDate={minDate} //this specifies what a user can/cant select
          maxDate={maxDate}
          placeholderText="Check-in Date"
          className="min-w-full bg-white p-2 focus:outline-none"
          wrapperClassName="min-w-full"
        />
      </div>
      <div>
        <DatePicker
          selected={checkOut}
          onChange={(date) => setCheckOut(date as Date)}
          selectsStart
          startDate={checkIn}
          endDate={checkOut}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText="Check-out Date"
          className="min-w-full bg-white p-2 focus:outline-none"
          wrapperClassName="min-w-full"
        />
      </div>
      <div className="flex gap-1">
        {/* w-2/3:we want search to take up 2/3 of available space and clear to 1/3 space */}
        <button className="w-2/3 bg-blue-600 text-white h-full p-2 font-bold text-xl hover:bg-blue-500">
          Search
        </button>
        <button className="w-1/3 bg-red-600 text-white h-full p-2 font-bold text-xl hover:bg-red-500">
          Clear
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
