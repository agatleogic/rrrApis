import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const SidebarContext = createContext({
  showingSidebar: false,
  setShowingSidebar: () => {}
});

const SidebarContextProvider = ({ children }) => {
  const [showingSidebar, setShowingSidebar] = useState(false);
  return (
    <SidebarContext.Provider
      value={{
        showingSidebar,
        setShowingSidebar
      }}>
      {children}
    </SidebarContext.Provider>
  );
};

SidebarContextProvider.propTypes = {
  children: PropTypes.element.isRequired
};

const useSidebarContext = () => useContext(SidebarContext);

export { SidebarContextProvider, SidebarContext, useSidebarContext };
