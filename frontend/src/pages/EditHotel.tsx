import { useMutation, useQuery } from "react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../contexts/AppContext";

const EditHotel = () => {
  const { hotelId } = useParams();
  const { showToast } = useAppContext();
  //react query to call fetch req we just created
  const { data: hotel } = useQuery( //here data obj contains hotel
    "fetchMyHotelById",
    () => apiClient.fetchMyHotelById(hotelId || ""), //this || "" condition put to make tyepscript happy
    // this query is only gona run if we have a hotelid, if hotelid value exists then !!hotelid returns true, else(if undefined/null) false
    {
      enabled: !!hotelId,
    }
  );

  //endpoint to call to edit hotel
  const { mutate, isLoading } = useMutation(apiClient.updateMyHotelById, {
    onSuccess: () => {
      //bfor writing test for edit page we add our toast msg whenever we make a req to see a hotel
      showToast({ message: "Hotel Saved!", type: "SUCCESS" });
    },
    onError: () => {
      showToast({ message: "Error Saving Hotel", type: "ERROR" });
    },
  });

  //this func called when form is submited, func we create that we pass to managehotel func onsave prop
  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  return (
    //we here populating the hotel we want to edit
    <ManageHotelForm hotel={hotel} onSave={handleSave} isLoading={isLoading} />
    // ManageHotelForm can be reused, does different things based on different pages we on
  );
};

export default EditHotel;
