import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Auth } from "aws-amplify";
import axios from "axios";
import { useAlertContext } from "./AlertContext";
import {
  API_CREATE_MODEL_URI,
  API_GET_MODELS_URI,
  API_UPDATE_MODEL_URI,
  DEFAULT_CONFIG,
  USER_PROFILE_MODEL
} from "./Constants";

const AuthContext = createContext({
  submitting: false,
  fetching: false,
  loggedIn: false,
  user: null,
  profile: null,
  userVerify: false,
  userAttributes: [],
  login: async () => {},
  register: async () => {},
  confirmSignup: async () => {},
  resetPassword: async () => {},
  forgotPassword: async () => {},
  setUser: async () => {},
  logout: async () => {},
  fetchUserAttributes: async () => {},
  fetchCurrentUser: async () => {},
  refreshSession: async () => {},
  retryCount: 0,
  createOdooProfile: async () => {},
  updateOdooProfile: async () => {},
  searchOdooProfile: async () => {}
});

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userVerify, setUserVerify] = useState(false);
  const [userAttributes, setUserAttributes] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [requestInterceptorIds, setRequestInterceptorIds] = useState([]);
  const { setError } = useAlertContext();

  useEffect(() => {
    fetchCurrentUser().then(async () => {
      // await fetchUserAttributes();
    });
  }, []);

  const registerRequestInterceptor = (u) => {
    // Remove previous interceptor
    requestInterceptorIds.forEach((id) => axios.interceptors.request.eject(id));
    // Request interceptor
    const id = axios.interceptors.request.use((config) => {
      if (u.getSignInUserSession() !== null) {
        config.headers.Authorization = u.getSignInUserSession().getIdToken().jwtToken;
      }
      return config;
    });
    setRequestInterceptorIds([...requestInterceptorIds, id]);
  };

  useEffect(() => {
    if (user && user.getSignInUserSession()) {
      registerRequestInterceptor(user);
      // Response interceptor
      // axios.interceptors.response.use((resp) => {
      //   if (resp.statusCode === 401) {
      //     refreshSession();
      //   }
      //   return resp;
      // });
      setLoggedIn(true);
      setUserVerify(!!user.attributes?.email_verified);
    } else {
      setLoggedIn(false);
      setUserVerify(false);
    }
  }, [user]);

  const searchOdooProfile = async (email) => {
    return await axios
      .post(API_GET_MODELS_URI, {
        configName: DEFAULT_CONFIG,
        model: USER_PROFILE_MODEL,
        fields: [["email", "=", email]],
        outputrecords: { fields: {}, limit: 1 }
      })
      .then((resp) => {
        setProfile(resp.data[0]);
        return resp.data[0];
      });
  };

  const updateOdooProfile = async (id, payload) => {
    return await axios
      .post(API_UPDATE_MODEL_URI, {
        configName: DEFAULT_CONFIG,
        model: USER_PROFILE_MODEL,
        input: payload,
        id
      })
      .then((resp) => {
        return resp.data;
      });
  };

  const createOdooProfile = async (payload) => {
    const resp = await axios
      .post(API_CREATE_MODEL_URI, {
        configName: DEFAULT_CONFIG,
        model: USER_PROFILE_MODEL,
        input: payload
      })
      .then((resp) => resp.data);

    // update cognito user attributes
    await Auth.updateUserAttributes(user, {
      "custom:CREATION-DATE": new Date(),
      "custom:ORIGINATING-APP": "R3API",
      "custom:PROFILE-CRM": "odoo"
    });

    return resp;
  };

  const fetchCurrentUser = useCallback(async () => {
    if (user) {
      return user;
    }
    setFetching(true);
    let u = null;
    try {
      u = await Auth.currentAuthenticatedUser();
      registerRequestInterceptor(u);
      await searchOdooProfile(u.attributes.email);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : typeof e === "string" ? e : "";
      throw new Error(errorMsg);
    } finally {
      setUser(u);
      setFetching(false);
    }
    return u;
  }, [user]);

  const refreshSession = () => {
    console.log("refresh session called");
    return new Promise((resolve, reject) => {
      Auth.currentAuthenticatedUser()
        .then((currentUser) => {
          const currentSession = currentUser.signInUserSession;
          currentUser.refreshSession(currentSession.refreshToken, (err, session) => {
            console.log(err, session);
            if (err) {
              setRetryCount(retryCount + 1);
              reject(err);
              return;
            }
            requestInterceptorIds.forEach((id) => axios.interceptors.request.eject(id));
            // axios.interceptors.response.eject(0);
            const id = axios.interceptors.request.use((config) => {
              console.log("new interceptor called");
              config.headers.Authorization = session.getIdToken().jwtToken;
              resolve(true);
              return config;
            });
            setRequestInterceptorIds([...requestInterceptorIds, id]);
          });
        })
        .catch((e) => {
          setRetryCount(retryCount + 1);
          reject(e);
        });
    });
  };

  const login = async ({ username, password }) => {
    setSubmitting(true);
    setFetching(true);
    try {
      const u = await Auth.signIn(username, password);
      setUser(u);
      registerRequestInterceptor(u);
      await searchOdooProfile(u.attributes.email);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSubmitting(false);
      setFetching(false);
    }
  };

  const logout = async () => {
    setSubmitting(true);
    try {
      await Auth.signOut();
      setUser(null);
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchUserAttributes = useCallback(async () => {
    let attributes = [];
    if (user) {
      try {
        attributes = await Auth.userAttributes(user);
      } catch (e) {
        console.log(e);
        if (e.code === "UserNotFoundException") {
          await logout();
        }
      }
    }
    setUserAttributes(attributes);
    return attributes;
  }, [user, logout]);

  const forgotPassword = async (email) => {
    setSubmitting(true);
    try {
      await Auth.forgotPassword(email);
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetPassword = async (username, code, password) => {
    setSubmitting(true);
    try {
      await Auth.forgotPasswordSubmit(username, code, password);
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const register = async ({ username, password }) => {
    try {
      setSubmitting(true);
      const { user } = await Auth.signUp(username, password);
      setUserVerify(false);
      setUser(user);
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmSignup = async (username, code) => {
    try {
      setSubmitting(true);
      await Auth.confirmSignUp(username, code);
      // setUserVerify(true);
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        fetching,
        user,
        profile,
        userVerify,
        submitting,
        userAttributes,
        login,
        logout,
        fetchUserAttributes,
        setUser,
        retryCount,
        refreshSession,
        fetchCurrentUser,
        forgotPassword,
        resetPassword,
        loggedIn,
        register,
        confirmSignup,
        createOdooProfile,
        updateOdooProfile,
        searchOdooProfile
      }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.element.isRequired
};

const useAuthContext = () => useContext(AuthContext);

export { AuthContextProvider, AuthContext, useAuthContext };
