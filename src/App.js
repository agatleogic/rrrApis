import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import {
  AuthRoute,
  EnsureHasProfile,
  EnsureVerified,
  GuestRoute,
  RedirectIfVerified
} from "./middlewares";
import NoMatch from "./Pages/NoMatch";

import EngineConfigStack from "./Routes/EngineConfigStack";
import ApiGenerationStack from "./Routes/ApiGenerationStack";
import MyApiStack from "./Routes/MyApiStack";
import { ToolTipContextProvider } from "./Context/ToolTipContext";
import Profile from "./Pages/Profile";
import { SidebarContextProvider } from "./Context/SidebarContext";
import { LanguageContextProvider } from "./Context/LanguageContext";
import Register from "./Pages/Register";
import Verify from "./Pages/Verification";
import ApiView from "./Pages/ApiView";
import ForgotPassword from "./Pages/ForgotPassword";
import { ApiGenerationContextProvider } from "./Context/ApiGenerationContext";
import { MyApiContextProvider } from "./Context/MyApiContext";
import { EngineConfigContextProvider } from "./Context/EngineConfigContext";
import Payment from "./Pages/Payment";

function App() {
  return (
    <LanguageContextProvider>
      <ToolTipContextProvider>
        <SidebarContextProvider>
          <EngineConfigContextProvider>
            <MyApiContextProvider>
              <ApiGenerationContextProvider>
                <Routes>
                  <Route path="/" element={<Navigate replace to="/home" />} />
                  <Route path="/" element={<GuestRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                  </Route>
                  <Route path="/" element={<RedirectIfVerified />}>
                    <Route path="/verify" element={<Verify />} />
                  </Route>
                  <Route path="/" element={<AuthRoute />}>
                    <Route path="/" element={<EnsureVerified />}>
                      <Route path="/payment" element={<Payment />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/" element={<EnsureHasProfile />}>
                        <Route path="/home" element={<Home />} />
                        <Route path="/my-apis/*" element={<MyApiStack />} />
                        <Route path="/engine-config/*" element={<EngineConfigStack />} />
                        <Route path="/api-generator/*" element={<ApiGenerationStack />} />
                        <Route path="/api-view" element={<ApiView />} />
                      </Route>
                    </Route>
                  </Route>
                  <Route path="*" element={<NoMatch />} />
                </Routes>
              </ApiGenerationContextProvider>
            </MyApiContextProvider>
          </EngineConfigContextProvider>
        </SidebarContextProvider>
      </ToolTipContextProvider>
    </LanguageContextProvider>
  );
}

export default App;
