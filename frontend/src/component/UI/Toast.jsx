import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

const Toast = ({
  message,
  type = "success",
  isVisible,
  duration = 3000,
  onClose,
  position = "top-center",
  showProgress = true,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingProgress = Math.max(
          0,
          100 - (elapsedTime / duration) * 100
        );
        
        setProgress(remainingProgress);

        if (elapsedTime >= duration) {
          clearInterval(timer);
          onClose();
        }
      }, 10);

      return () => clearInterval(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const toastStyles = {
    success: {
      background: "bg-green-500",
      text: "text-white",
      border: "border-green-700",
      icon: FaCheckCircle,
    },
    error: {
      background: "bg-red-500",
      text: "text-white",
      border: "border-red-700",
      icon: FaTimesCircle,
    },
    warning: {
      background: "bg-yellow-500",
      text: "text-black",
      border: "border-yellow-700",
      icon: FaExclamationTriangle,
    },
    info: {
      background: "bg-blue-500",
      text: "text-white",
      border: "border-blue-700",
      icon: FaInfoCircle,
    },
  };

  const positionStyles = {
    "top-center": "top-0 inset-x-0 flex justify-center",
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0",
    "bottom-center": "bottom-0 inset-x-0 flex justify-center",
    "bottom-right": "bottom-0 right-0",
    "bottom-left": "bottom-0 left-0",
  };

  const ToastIcon = toastStyles[type].icon;

  return (
    <div
      className={`fixed ${positionStyles[position]} px-4 z-50 transition-opacity ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative w-58 max-w-md px-6 py-4 mt-4 transition-transform transform ${
          isVisible ? "scale-100" : "scale-75"
        } ${toastStyles[type].background} ${
          toastStyles[type].text
        } border-l-4 ${toastStyles[type].border} shadow-lg`}
        style={{ borderRadius: "8px" }}
      >
        <div className="flex items-center space-x-3">
          <ToastIcon className="w-5 h-5" />
          <p className="text-sm font-medium flex-1">{message}</p>
          <button
            className="text-white hover:text-gray-200"
            onClick={onClose}
            aria-label="Close Toast"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        {showProgress && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30">
            <div
              className="h-full bg-white/70 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;