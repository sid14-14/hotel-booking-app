import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForm";

const ImagesSection = () => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<HotelFormData>();

  //here we displaying the images we added to our hotel, we want it to be displayed when we wan to edit it
  const existingImageUrls = watch("imageUrls");

  const handleDelete = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>, //specifying type for a mouse btn click
    imageUrl: string
  ) => {
    event.preventDefault(); //whenver we click inside btn inside the form, default action is to submit the form, this line prevents that to happen
    //removing few imgurls and returning new arr
    setValue(
      "imageUrls",
      existingImageUrls.filter((url) => url !== imageUrl)
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Images</h2>
      {/* this gives the light grey border effect
      gap-4: between border and input  */}
      <div className="border rounded p-4 flex flex-col gap-4"> 
        {existingImageUrls && (
          <div className="grid grid-cols-6 gap-4">
            {existingImageUrls.map((url) => (
              // this acts as hover functionality which helps in deleting img if we want
              <div className="relative group"> 
                <img src={url} className="min-h-full object-cover" />
                <button
                  onClick={(event) => handleDelete(event, url)}
                  // absolute inset-0: btn is positioned based on its closest el that has classname of relative
                  //flex items-center justify-center: centers the text in the middle of the img 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 text-white"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          multiple //lets user select multiple files
          accept="image/*" //only files of type image is accepted not text/pdf ...
          //w-full: take all space available w/in container
          className="w-full text-gray-700 font-normal"
          {...register("imageFiles", {
            validate: (imageFiles) => {
              const totalLength =
                imageFiles.length + (existingImageUrls?.length || 0); //existingImageUrls: whenever user gona add new hotel then there arent gona be img urls, so this works for both addhotel and edithotel situation

              if (totalLength === 0) {
                return "At least one image should be added";
              }

              if (totalLength > 6) {
                return "Total number of images cannot be more than 6";
              }

              return true;
            },
          })}
        />
      </div>
      {errors.imageFiles && (
        <span className="text-red-500 text-sm font-bold">
          {errors.imageFiles.message}
        </span>
      )}
    </div>
  );
};

export default ImagesSection;
