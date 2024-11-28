import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../component/UI/Toast"

// Create a Toast Context
const ToastContext = createContext();

// Custom hook to use the Toast Context
export const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Function to show a toast
  const showToast = useCallback(
    (message, type = "success", duration = 3000) => {
      setToast({ isVisible: true, message, type });

      // Automatically hide the toast after the duration
      setTimeout(() => {
        setToast((prevToast) => ({ ...prevToast, isVisible: false }));
      }, duration);
    },
    []
  );

  // Function to manually close the toast
  const closeToast = () => setToast({ ...toast, isVisible: false });

  return (
    <ToastContext.Provider value={showToast}>
    {console.log("showToast provided:", showToast)} {/* Debug */}
    {children}
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={closeToast}
    />
  </ToastContext.Provider>
  );
};

export default ToastProvider;
