import { useQuery } from "react-query";
import { useSearchContext } from "../contexts/SearchContext";
import * as apiClient from "../api-client";
import { useState } from "react";
import SearchResultsCard from "../components/SearchResultsCard";
import Pagination from "../components/Pagination";
import StarRatingFilter from "../components/StarRatingFilter";
import HotelTypesFilter from "../components/HotelTypesFilter";
import FacilitiesFilter from "../components/FacilitiesFilter";
import PriceFilter from "../components/PriceFilter";

const Search = () => {
  const search = useSearchContext(); //we get access to search terms the user has selected by going to the useSearchContext
  const [page, setPage] = useState<number>(1); //storing curr page here
  const [selectedStars, setSelectedStars] = useState<string[]>([]); //state obj to mange the stars
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>();
  const [sortOption, setSortOption] = useState<string>(""); //we dont need to initialize this as we working on drop-down

  //anyt page search para is changed its passed to api call
  const searchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(), //if we dont do tostr the type is of data, which wont get passed to the below searchParams in the useQuery as all accept str type
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
    stars: selectedStars,
    types: selectedHotelTypes,
    facilities: selectedFacilities,
    maxPrice: selectedPrice?.toString(),
    sortOption,
    //we havent stored page val. we gona store page and state in the search page itself,
    //keepin all fetch reqs and state objs and contexts at page level helps to manage data and pass it donw to component
  };
  
  //converting user entered search form, into search paras obj which will pass to fetch req
  //whenever user goes to /search page, search endpoint will call the vals user entered
  const { data: hotelData } = useQuery(["searchHotels", searchParams], () =>
    apiClient.searchHotels(searchParams)
  //after api call its passed here, its refetched here after a chagne 
  );

  //type for prop: HTMLInputElement
  const handleStarsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const starRating = event.target.value; //actual value user has checked

    //func to call the update the selectedstarts in state
    setSelectedStars((prevStars) =>
      event.target.checked //did user check/not this checkbox
        ? [...prevStars, starRating] //if yes, copy the prev star that are currenlty in state(which is arr of strs) and we want to add new stars at the end of the arr and save the arr into the state
        : prevStars.filter((star) => star !== starRating) //if they unchecked it, take the curr stars in curr/prev state, and filter out stars we just selected. and it returns new arr of all those start except those stars and set everything to state, thus removing the unchecked stars from state here
    );
  };

  const handleHotelTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const hotelType = event.target.value;

    setSelectedHotelTypes((prevHotelTypes) =>
      event.target.checked
        ? [...prevHotelTypes, hotelType]
        : prevHotelTypes.filter((hotel) => hotel !== hotelType)
    );
  };

  const handleFacilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const facility = event.target.value;

    setSelectedFacilities((prevFacilities) =>
      event.target.checked
        ? [...prevFacilities, facility]
        : prevFacilities.filter((prevFacility) => prevFacility !== facility)
    );
  };

  return (
    //grid-cols-1=> default for small screens
    //lg:grid-cols-[250px_1fr] => for larage screens 2 cols, left section=250px and right rest
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      {/* h-fit=> fit the height of conatiner, sticky=> stick the window to the window when we scrol down */}
      <div className="rounded-lg border border-slate-300 p-5 h-fit sticky top-10"> 
        {/* space out all the stuff in our filters col */}
        <div className="space-y-5"> 
          <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
            Filter by:
          </h3>
          <StarRatingFilter
            selectedStars={selectedStars}
            onChange={handleStarsChange}
          />
          <HotelTypesFilter
            selectedHotelTypes={selectedHotelTypes}
            onChange={handleHotelTypeChange}
          />
          <FacilitiesFilter
            selectedFacilities={selectedFacilities}
            onChange={handleFacilityChange}
          />
          <PriceFilter
            selectedPrice={selectedPrice}
            onChange={(value?: number) => setSelectedPrice(value)}
          />
        </div>
      </div>
      {/* space out our text at the top and the sort options in the search results */}
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            {/* this is why we send pagination data from our api */}
            {hotelData?.pagination.total} Hotels found
            {search.destination ? ` in ${search.destination}` : ""}
          </span>
          {/* we have a stabe obj that hold the drop down val and it passes that val to our api, and backend will add it to the query we built and return res in an certain ord */}
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="">Sort By</option>
            <option value="starRating">Star Rating</option>
            <option value="pricePerNightAsc">
              Price Per Night (low to high)
            </option>
            <option value="pricePerNightDesc">
              Price Per Night (high to low)
            </option>
          </select>
        </div>
        {hotelData?.data.map((hotel) => (
          <SearchResultsCard hotel={hotel} />
        ))}
        <div>
          <Pagination
          // we set the default val to 1 caz its better than breaking the page
            page={hotelData?.pagination.page || 1}
            pages={hotelData?.pagination.pages || 1}
            onPageChange={(page) => setPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
