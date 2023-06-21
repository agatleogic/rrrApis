/* eslint-disable no-undef */
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import i18next from "i18next";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import common_de from "./translations/de/common.json";
import common_fr from "./translations/fr/common.json";
import common_es from "./translations/es/common.json";
import common_en from "./translations/en/common.json";
import { BrowserRouter } from "react-router-dom";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
Amplify.configure(awsExports);

import { I18nextProvider } from "react-i18next";
import { AuthContextProvider } from "./Context/AuthContext";
import { AlertContextProvider } from "./Context/AlertContext";
import axios from "axios";
import { API_BASE_URL } from "./Context/Constants";

axios.defaults.baseURL = API_BASE_URL;

i18next.init({
  interpolation: { escapeValue: false }, // React already does escaping
  lng: "en", // language to use
  resources: {
    en: {
      common: common_en // 'common' is our custom namespace
    },
    de: {
      common: common_de
    },
    fr: {
      common: common_fr
    },
    es: {
      common: common_es
    }
  }
});
ReactDOM.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <AlertContextProvider>
          <AuthContextProvider>
            <App />
          </AuthContextProvider>
        </AlertContextProvider>
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
