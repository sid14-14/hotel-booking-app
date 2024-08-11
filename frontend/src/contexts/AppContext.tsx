//we gonna use react context api to implement my booking and my jotel for as it alows us to store global state which happen to use any 3rd part libs
//anytime we want to expose things or data in our app, we put it into appcontext, not everytime it goes into appcontext, sometime storing state in local component is best 

import React, { useContext, useState } from "react";
import Toast from "../components/Toast";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import { loadStripe, Stripe } from "@stripe/stripe-js";
const STRIPE_PUB_KEY = import.meta.env.VITE_STRIPE_PUB_KEY || "";

//popup on top-right corner, eg: loggedin success
type ToastMessage = {
  message: string;
  type: "SUCCESS" | "ERROR";
};

//describes differnt things we are exposing to our components
type AppContext = {
  showToast: (toastMessage: ToastMessage) => void;
  isLoggedIn: boolean;
  stripePromise: Promise<Stripe | null>;
};

// when app loads for first time, context always undefined
const AppContext = React.createContext<AppContext | undefined>(undefined);

//initialize stripe when the app loads, as we dont want to constanly loading stripe as it does a bunc of api calls from the browser and we dont want to have that perf hit
const stripePromise = loadStripe(STRIPE_PUB_KEY);

//provider wraps up our components & gives our components access to all things in context 
//its similar to std react component, we can store state, hook and other stuff, it accepts token prompt
//it accepts prop var: children here, we destruring
export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  //declase state obj which holds state of toast
  const [toast, setToast] = useState<ToastMessage | undefined>(undefined);

  //this makes sure if there is an error or not based on verifying cookie
  //this runs when an action causes app to re-render(eg: refresh page/ user change route)
  const { isError } = useQuery("validateToken", apiClient.validateToken, {
    retry: false,
  });

  return (
    <AppContext.Provider
      value={{
        showToast: (toastMessage) => {
          //change our state var: toast, whenever component sends us a new msg and a new type
          setToast(toastMessage); //in our Register.tsx component onsuccess and onerror still gong to call showtoast func, here we setting the val to state here. and toast is rendered
        },
        isLoggedIn: !isError,
        stripePromise,
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(undefined)} //whenever timer runs out, we set state of settoast var to be undefined=> cazing rerun, and when rerednder toast && condition, as its false so toast component isnt going to render
        />
      )}
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  return context as AppContext;
};
// if our comoponet needs something from context they can use this hook