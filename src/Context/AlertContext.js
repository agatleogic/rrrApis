import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

const AlertContext = createContext({
  errors: {},
  clearErrors: () => {},
  setErrors: () => {},
  setError: () => {},
  successMessage: "",
  setSuccessMessage: () => {},
  setSuccess: () => {}
});

const AlertContextProvider = ({ children }) => {
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [persist, setPersist] = useState(false);
  const location = useLocation();

  const clearErrors = () => {
    setErrors({});
  };

  const setSuccess = (message, flash = false) => {
    setSuccessMessage(message ? [message] : message);
    clearErrors();
    setPersist(flash);
  };

  const setError = (message, flash = false) => {
    setErrors({ message });
    setSuccessMessage("");
    setPersist(flash);
  };

  useEffect(() => {
    if (Object.keys(errors).length) {
      if (persist) {
        setPersist(false);
      } else {
        clearErrors();
      }
    }
    if (successMessage) {
      if (persist) {
        setPersist(false);
      } else {
        setSuccessMessage("");
      }
    }
  }, [location]);

  return (
    <AlertContext.Provider
      value={{
        errors,
        clearErrors,
        setErrors,
        successMessage,
        setSuccessMessage,
        setError,
        setSuccess
      }}>
      {children}
    </AlertContext.Provider>
  );
};

AlertContextProvider.propTypes = {
  children: PropTypes.element.isRequired
};

const useAlertContext = () => useContext(AlertContext);

export { AlertContextProvider, AlertContext, useAlertContext };
