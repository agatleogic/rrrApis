import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAlertContext } from "../Context/AlertContext";

const ErrorMessage = ({ children, errors, onClose }) => {
  const { errors: globalErrors } = useAlertContext();
  const [message, setMessage] = useState("");

  const handleClose = () => {
    setMessage("");
    onClose && onClose();
  };

  useEffect(() => {
    setMessage(children || Object.values(errors || globalErrors).join("<br />"));
  }, [errors, globalErrors]);

  return message ? (
    <div className="absolute top-28 right-4 flex flex-col items-end z-10">
      <div className="flex px-4 py-2 items-center space-x-4 bg-red-100 rounded border border-red-200 mb-6">
        <p className="text-red-700 font-sm">{message}</p>
        <button
          type="button"
          className="w-8 h-8 rounded text-2xl font-light bg-red-200 border-red-500"
          onClick={handleClose}>
          &times;
        </button>
      </div>
    </div>
  ) : null;
};

ErrorMessage.propTypes = {
  children: PropTypes.node,
  errors: PropTypes.object,
  onClose: PropTypes.func
};

export default ErrorMessage;
