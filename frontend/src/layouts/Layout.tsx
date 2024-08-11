import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";

// describes props "<div className="flex flex-col min-h-screen">" component expects
interface Props {
  //we want to accept any react componetn
  children: React.ReactNode;
}

// { children }: Props-destructuring props to get children prop caz this type script
const Layout = ({ children }: Props) => {
  return (
    // aligns our els in column and app takes whole screen keeping header at top and fooyer at bottom
    <div className="flex flex-col min-h-screen">
      <Header />
      <Hero />
      {/* mx-auto: centers our content and aligns w rest of content of header and footer */}
      <div className="container mx-auto">
        <SearchBar />
      </div>
      {/* flex-1: takes up all the available space, as we mentioned min-h-screen so plenty of space for our content to take up */}
      <div className="container mx-auto py-10 flex-1">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
