import { Link } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import SignOutButton from "./SignOutButton";

const Header = () => {
  const { isLoggedIn } = useAppContext();

  return (
    //blue color of intensity/dark 800, padding top-bot=6
    <div className="bg-blue-800 py-6"> 
    {/* //container mx-auto:this container makes sure spacing there in left and right and makes sure content isnt pushed against the edges */}
    {/* //flex justify-between: this pushes the title and sign-in as far as possib(while also maintaining the space on left and rig) */}
      <div className="container mx-auto flex justify-between">
        <span className="text-3xl text-white font-bold tracking-tight">
          <Link to="/">MernHolidays.com</Link>
        </span>
        {/* adds space b/w the child els in span tag */}
        <span className="flex space-x-2">
          {isLoggedIn ? (
            <>
              <Link
              // items-center: aligns items vertically
                className="flex items-center text-white px-3 font-bold hover:bg-blue-600"
                to="/my-bookings"
              >
                My Bookings
              </Link>
              <Link
                className="flex items-center text-white px-3 font-bold hover:bg-blue-600"
                to="/my-hotels"
              >
                My Hotels
              </Link>
              {/* it has the api call to log out */}
              <SignOutButton /> 
            </>
          ) : (
            <Link
              to="/sign-in"
              className="flex bg-white items-center text-blue-600 px-3 font-bold hover:bg-gray-100"
            >
              Sign In
            </Link>
          )}
        </span>
      </div>
    </div>
  );
};

export default Header;
