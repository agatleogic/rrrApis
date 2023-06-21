import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const ToolTipContext = createContext({
  switchToolTip: true,
  setSwitchToolTip: async () => {}
});

const ToolTipContextProvider = ({ children }) => {
  const [switchToolTip, setSwitchToolTip] = useState(true);

  return (
    <ToolTipContext.Provider value={{ switchToolTip, setSwitchToolTip }}>
      {children}
    </ToolTipContext.Provider>
  );
};

ToolTipContextProvider.propTypes = {
  children: PropTypes.element.isRequired
};

const useToolTipContext = () => useContext(ToolTipContext);

export { ToolTipContextProvider, ToolTipContext, useToolTipContext };
