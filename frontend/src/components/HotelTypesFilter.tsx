//this is almost copy of StarRatingFilter
import { hotelTypes } from "../config/hotel-options-config";

type Props = {
  selectedHotelTypes: string[]; //currently selected hoteltypes if any
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; //func to update the state
};

const HotelTypesFilter = ({ selectedHotelTypes, onChange }: Props) => {
  return (
    <div className="border-b border-slate-300 pb-5">
      <h4 className="text-md font-semibold mb-2">Hotel Type</h4>
      {hotelTypes.map((hotelType) => (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded"
            value={hotelType}
            checked={selectedHotelTypes.includes(hotelType)}
            onChange={onChange}
          />
          <span>{hotelType}</span>
        </label>
      ))}
    </div>
  );
};

export default HotelTypesFilter;
