// we can tell the componentes we need to capture the list of filters, user has decided to select
type Props = {
  selectedStars: string[]; //store state of star rating user has selected in the parent and pass it as props
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; //type for an event whenver a checkbox is checked
};

const StarRatingFilter = ({ selectedStars, onChange }: Props) => {
  return (
    // adds a seperator at the bottom, so the test filter is seperate from other filters
    <div className="border-b border-slate-300 pb-5">
      <h4 className="text-md font-semibold mb-2">Property Rating</h4>
      {["5", "4", "3", "2", "1"].map((star) => (
        // space-x-2: space b/w input and label text
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded"
            value={star}
            checked={selectedStars.includes(star)} //check if the selected stars we recieved from state contains curretn star this map func is currently on
            onChange={onChange}
          />
          <span>{star} Stars</span>
        </label>
      ))}
    </div>
  );
};

export default StarRatingFilter;
