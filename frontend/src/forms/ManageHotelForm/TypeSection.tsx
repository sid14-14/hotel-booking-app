import { useFormContext } from "react-hook-form";
import { hotelTypes } from "../../config/hotel-options-config";
import { HotelFormData } from "./ManageHotelForm";

//we can test our web-app based on btns

const TypeSection = () => {
  //hook into our add hotel form using useFormContext
  const {
    register, //to track the registered hotel type
    watch,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  // any time this type prop changes we get new val
  const typeWatch = watch("type");

  return (
    //accesses container for the section
    <div>
      <h2 className="text-2xl font-bold mb-3">Type</h2>
      {/* we declaring we need 5 cols of gap 2, this is css grid */}
      <div className="grid grid-cols-5 gap-2">
      {/* hotelTypes is str array */}
        {hotelTypes.map((type) => (
          // label is radio btns made to look like chips
          <label
          //add some jsx logic to display different tailwind style deping on typewatch
            className={
              typeWatch === type
                ? "cursor-pointer bg-blue-300 text-sm rounded-full px-4 py-2 font-semibold"
                : "cursor-pointer bg-gray-300 text-sm rounded-full px-4 py-2 font-semibold"
            }
          >
            <input
              type="radio"
              value={type}
              {...register("type", {
                required: "This field is required",
              })}
              className="hidden"
            />
            {/* type is str that comes from hotelTypes arr */}
            <span>{type}</span>
          </label>
        ))}
      </div>
      {errors.type && (
        <span className="text-red-500 text-sm font-bold">
          {errors.type.message}
        </span>
      )}
    </div>
  );
};

export default TypeSection;
