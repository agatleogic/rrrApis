import React, { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import i18next from "i18next";

const LanguageContext = createContext({
  selectedLang: localStorage.getItem("lang") || "en",
  setSelectedLang: () => {}
});

const LanguageContextProvider = ({ children }) => {
  const [selectedLang, setSelectedLang] = useState(localStorage.getItem("lang") || "en");

  useEffect(() => {
    localStorage.setItem("lang", selectedLang);
    i18next.changeLanguage(selectedLang);
  }, [selectedLang]);

  return (
    <LanguageContext.Provider
      value={{
        selectedLang,
        setSelectedLang
      }}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageContextProvider.propTypes = {
  children: PropTypes.element.isRequired
};

const useLanguageContext = () => useContext(LanguageContext);

export { LanguageContextProvider, LanguageContext, useLanguageContext };
