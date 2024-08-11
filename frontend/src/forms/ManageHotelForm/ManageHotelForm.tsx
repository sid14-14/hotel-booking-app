import { FormProvider, useForm } from "react-hook-form";
import DetailsSection from "./DetailsSection";
import TypeSection from "./TypeSection";
import FacilitiesSection from "./FacilitiesSection";
import GuestsSection from "./GuestsSection";
import ImagesSection from "./ImagesSection";
import { HotelType } from "../../../../backend/src/shared/types";
import { useEffect } from "react";

export type HotelFormData = {
  name: string;
  city: string;
  country: string;
  description: string;
  type: string;
  pricePerNight: number;
  starRating: number;
  facilities: string[];
  imageFiles: FileList; //than str arr we sending filelist, so we cant use on back-end
  imageUrls: string[];
  adultCount: number;
  childCount: number;
};

type Props = { //declare type up here in props, including paras that pass into the func
  hotel?: HotelType; //we only receive hotel when we on edit page, whereas in addhotel we wont see
  onSave: (hotelFormData: FormData) => void; //declaring the types up here in the props including any paras passed into it
  isLoading: boolean;
};

const ManageHotelForm = ({ onSave, isLoading, hotel }: Props) => {
  // instead of destructing register func, we just assiign valu to a var,
  //caz we brokeup up our form into smaller components, we need ot use form provider so that child can get access to all hoook react meths
  const formMethods = useForm<HotelFormData>();
  // handleSubmit func will submit form, handle any validation, and pass data to our func 
  const { handleSubmit, reset } = formMethods;

  useEffect(() => { //whenever the component receives new hotel data, then useEffect gona run and gona reset the form for whatever the hotel data is,[hotel, reset]: run any time hotel data changes 
    reset(hotel);
  }, [hotel, reset]);

  // handleSubmit after validating submits formdata(of type HotelFormData) 
  const onSubmit = handleSubmit((formDataJson: HotelFormData) => {
    //create new data obj and call our api
    // console.log(formData);
    // as we working w imgs, we cant send it as json, so we need to send this a multi part form, we wrote code for that in our post endpoint so that it can handle multiport form, so just need to create a req in here in the frontedn 
    const formData = new FormData();
    if (hotel) { //this case for if we in editpage, if we have hotel we add the hotelid to the form data, for endpoint req to work need to know hotelid we want to edit 
      formData.append("hotelId", hotel._id);
    }
    formData.append("name", formDataJson.name);
    formData.append("city", formDataJson.city);
    formData.append("country", formDataJson.country);
    formData.append("description", formDataJson.description);
    formData.append("type", formDataJson.type);
    formData.append("pricePerNight", formDataJson.pricePerNight.toString());
    formData.append("starRating", formDataJson.starRating.toString());
    formData.append("adultCount", formDataJson.adultCount.toString());
    formData.append("childCount", formDataJson.childCount.toString());

    //becaz we can have an no. of facilities we use for each
    formDataJson.facilities.forEach((facility, index) => {
      //appending an arr to our formdata
      formData.append(`facilities[${index}]`, facility);
    });

    //this will add the urls so its saved to the backend, the below will overwrite existing imgarray if edited
    if (formDataJson.imageUrls) {
      formDataJson.imageUrls.forEach((url, index) => {
        formData.append(`imageUrls[${index}]`, url);
      });
    }

    // taking the image fiels of type file list, and converting it to an array, caz file list type doesnt let us use for each
    Array.from(formDataJson.imageFiles).forEach((imageFile) => {
      // multer in the backend takes array of img files and process them for us and attach it to our req, which is stuff we created when we added our backend endpoint
      formData.append(`imageFiles`, imageFile);
    });
    //whenever a form is seen, we build up a formdata obj from our formDataJson and is passed to onSave
    //then handleSave is called in AddHotel.tsx which passes formdat to fetch req(apiclient.addmyhotel). and in our api-client.ts formdata gets passed to body 
    onSave(formData);
  });

  return (
    //when we create induvidual child sections inside of this form we will be able to use these funcs that we get from useform, formprovider is similar to contex api
    <FormProvider {...formMethods}> 
      <form className="flex flex-col gap-10" onSubmit={onSubmit}>
        <DetailsSection />
        <TypeSection />
        <FacilitiesSection />
        <GuestsSection />
        <ImagesSection />
        {/* using span to position btn at end of container/far right */}
        <span className="flex justify-end">
          <button
            disabled={isLoading} //if isloading set this btn to true, thus cant submit form while prev req is loading. this prevents them from creating same hotel twice, and also refuses req on server
            type="submit"
            className="bg-blue-600 text-white p-2 font-bold hover:bg-blue-500 text-xl disabled:bg-gray-500"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </span>
      </form>
    </FormProvider>
  );
};

export default ManageHotelForm;
