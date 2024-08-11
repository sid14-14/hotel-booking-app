const Footer = () => {
  return (
    <div className="bg-blue-800 py-10">
      {/* flex: to arrange header, content and footer  */}
      {/* justify-between: push els to the edges  */}
      {/* items center aligns items vertically */}
      <div className="container mx-auto flex justify-between items-center">
      {/* tracking-tight: gives nice logo effect */}
        <span className="text-3xl text-white font-bold tracking-tight">
          MernHolidays.com
        </span>
        <span className="text-white font-bold tracking-tight flex gap-4">
          <p className="cursor-pointer">Privacy Policy</p>
          <p className="cursor-pointer">Terms of Service</p>
        </span>
      </div>
    </div>
  );
};

export default Footer;
