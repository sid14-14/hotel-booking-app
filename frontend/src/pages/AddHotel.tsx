import { useMutation } from "react-query";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import { useAppContext } from "../contexts/AppContext";
import * as apiClient from "../api-client";

const AddHotel = () => {
  const { showToast } = useAppContext();

  //logic to call api fetch req using usemutation hook
  //we doing fetch logic at page level caz we can make our manage hotel form reusable, whenever want ot edit hotel can use this addhotel page=>done ny onSave. depending on addhotel page(we working on), it calls addMyHotel endpoint. From edit hotel page we send slightly different api endpoint logic, we also passing func to the form handleSave as well, form dont know the difference  
  const { mutate, isLoading } = useMutation(apiClient.addMyHotel, {
    onSuccess: () => {
      showToast({ message: "Hotel Saved!", type: "SUCCESS" });
    },
    onError: () => {
      showToast({ message: "Error Saving Hotel", type: "ERROR" });
    },
  });

  //func to call mutate meth, it takes formdata obj we created after submitting the form
  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  //we put ManageHotelForm in its own component caz it makes the form re-usable, when we come to edit hotel-page we can use same form and it keeps all logic and components needed to create and edit hotel in same component
  //isLoading: disable the save btn when req is happening, so user not click on it too many times. as deping on nos of images, req might be slow. so we can block things in the ui
  return <ManageHotelForm onSave={handleSave} isLoading={isLoading} />;
};

export default AddHotel;
