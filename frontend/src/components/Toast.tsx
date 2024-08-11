import { useEffect } from "react";

//defining type for a prop
type ToastProps = {
  message: string;
  type: "SUCCESS" | "ERROR";
  onClose: () => void;
};

//by putting in the appcontext any component is able to go into appcontext and display toast bar msg

const Toast = ({ message, type, onClose }: ToastProps) => {
  //hide toast after 5s
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); //passed in Appcontext. setoast(undefined) set
    }, 5000);

    return () => {
      // resets timeer whenever our component is closed
      clearTimeout(timer);
    };
  }, [onClose]); //useeffect runs only when component gets rendered
  //our toast fun runs after render and closes after onclose

  const styles =
    type === "SUCCESS"
    // fixed: fixed at top right, top-4: add some spacing b/w top of el and top of window,right-4:spacing for rig of el and rig of window
    //max-w-md: we dont want it to take too much of screen dep on msg
      ? "fixed top-4 right-4 z-50 p-4 rounded-md bg-green-600 text-white max-w-md"
      : "fixed top-4 right-4 z-50 p-4 rounded-md bg-red-600 text-white max-w-md";

  return (
    //contaienr for toast component
    <div className={styles}>
      <div className="flex justify-center items-center"> {/*holds pos for content*/}
        <span className="text-lg font-semibold">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
