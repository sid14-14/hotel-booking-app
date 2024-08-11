import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { AppContextProvider } from "./contexts/AppContext.tsx";
import { SearchContextProvider } from "./contexts/SearchContext.tsx";

// add client-query to our app to wrap our comp in react query client FormProvider, this means our app has access to all hooks we added
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0, //0 given caz if any err by default react query does a retry indefinitely 
      //pros: if server down temporarily and comes back it hs do nthng
      // cons: many reqs it makes thus expensive which we dont want always
      //for nowwe set this off
    },
  },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <SearchContextProvider>
          <App />
        </SearchContextProvider>
      </AppContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
