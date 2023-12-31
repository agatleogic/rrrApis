import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "./Context/AuthContext";
import Layout from "./Layout";

const Loading = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-center text-2xl text-gray-700">Loading...</h1>
      </div>
    </Layout>
  );
};

const AuthRoute = () => {
  const { loggedIn, fetching } = useAuthContext();
  let location = useLocation();
  if (fetching) {
    return <Loading />;
  } else if (loggedIn) {
    return <Outlet />;
  }
  return <Navigate to="/login" state={{ from: location }} replace />;
};

const EnsureHasProfile = () => {
  const { fetching, profile } = useAuthContext();
  let location = useLocation();
  if (fetching) {
    return <Loading />;
  } else if (profile) {
    return <Outlet />;
  }
  return <Navigate to="/profile" state={{ from: location }} replace />;
};

const EnsureVerified = () => {
  const { fetching, userVerify } = useAuthContext();
  let location = useLocation();
  if (fetching) {
    return <Loading />;
  } else if (userVerify) {
    return <Outlet />;
  }
  return <Navigate to="/verify" state={{ from: location }} replace />;
};

const RedirectIfVerified = () => {
  const { fetching, userVerify } = useAuthContext();
  let location = useLocation();
  if (fetching) {
    return <Loading />;
  } else if (userVerify) {
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

const GuestRoute = () => {
  const { loggedIn, fetching } = useAuthContext();
  let location = useLocation();
  if (fetching) {
    if (location.pathname === "/login") {
      return <Outlet />;
    } else {
      return <Loading />;
    }
  } else if (loggedIn) {
    return (
      <Navigate to={location.state?.from?.pathname || "/home"} state={{ from: location }} replace />
    );
  }
  return <Outlet />;
};

export { AuthRoute, GuestRoute, EnsureHasProfile, EnsureVerified, RedirectIfVerified };
