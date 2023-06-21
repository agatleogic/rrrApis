import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import axios from "axios";
import { API_TEST_URI } from "./Constants";
import { useAlertContext } from "./AlertContext";
import { useTranslation } from "react-i18next";

const LABELS = [
  "name",
  "type",
  "version",
  "database",
  "url",
  "username",
  "password",
  "description"
];

const DEFAULT_FORM_VALUES = {
  name: "",
  type: "",
  version: "",
  database: "",
  url: "",
  username: "",
  password: "",
  description: ""
};

const DEFAULT_FILTERS = {
  type: "",
  version: "",
  url: "",
  database: "",
  search: ""
};

const EngineConfigContext = createContext({
  errors: {},
  submitting: false,
  fetching: false,
  list: [],
  currentConfig: null,
  setCurrentConfig: async () => {},
  create: async () => {},
  update: async () => {},
  fetchInfo: async () => {},
  destroy: async () => {},
  test: async () => {},
  formValues: DEFAULT_FORM_VALUES,
  // eslint-disable-next-line no-unused-vars
  setFormValues: (values) => {},
  filters: DEFAULT_FILTERS,
  setFilters: () => {},
  clearForm: () => {},
  clearFilters: () => {}
});

const EngineConfigContextProvider = ({ children }) => {
  const { user, userAttributes } = useAuthContext();
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const { setError, setSuccess } = useAlertContext();
  const [list, setList] = useState([]);
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const navigator = useNavigate();
  const { t } = useTranslation();

  const create = useCallback(
    async (data) => {
      if (list.length === 10) {
        setError(t("You've reached the maximum configuration limit!"));
        return;
      }
      try {
        setSubmitting(true);
        await update(`custom:connection-${list.length + 1}`, data);
        setFormValues({});
        setSuccess(t("Engine configuration created."));
        navigator("/engine-config", { replace: true });
      } catch (e) {
        setError(e.message);
        throw new Error(e.message);
      } finally {
        setSubmitting(false);
      }
    },
    [list]
  );

  const update = async (id, data) => {
    setSubmitting(true);
    try {
      await Auth.updateUserAttributes(user, {
        [id]: encodeInfo(data)
      });
      setSuccess(t("Engine configuration updated."));
      // navigator("/engine-config", { replace: true });
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const destroy = async (id) => {
    setSubmitting(true);
    try {
      await Auth.deleteUserAttributes(user, [id]);
      setSuccess(t("Engine configuration deleted."));
      navigator("/engine-config");
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const test = async (payload) => {
    setSubmitting(true);
    try {
      const result = await axios.post(API_TEST_URI, payload).then((resp) => resp.data);
      if (typeof result === "string") {
        setSuccess(result);
      }
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchInfo = useCallback(
    async (id) => {
      let config = null;
      if (!userAttributes.length) {
        setFetching(true);
        const attrs = await Auth.userAttributes(await Auth.currentAuthenticatedUser());
        config = decodeInfo(attrs.find((a) => a.Name === id)?.Value);
        setFetching(false);
      } else {
        config = decodeInfo(userAttributes.find((a) => a.Name === id)?.Value);
      }
      setCurrentConfig(config);
      return config;
    },
    [userAttributes]
  );

  const decodeInfo = (info) => {
    if (info)
      return info.split(";").reduce((prev, value, idx) => {
        return { ...prev, [LABELS[idx]]: value };
      }, {});

    return null;
  };

  const encodeInfo = (info) => {
    return LABELS.map((label) => info[label]).join(";");
  };

  useEffect(() => {
    setList(
      userAttributes
        .filter(({ Name }) => Name.includes("custom:connection"))
        .map(({ Name, Value }) => {
          return {
            id: Name,
            ...decodeInfo(Value)
          };
        })
    );
  }, [userAttributes]);

  const clearForm = () => {
    setFormValues({ ...DEFAULT_FORM_VALUES });
  };

  const clearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  return (
    <EngineConfigContext.Provider
      value={{
        currentConfig,
        setCurrentConfig,
        submitting,
        fetching,
        list,
        test,
        create,
        update,
        fetchInfo,
        destroy,
        setFormValues,
        formValues,
        filters,
        setFilters,
        clearForm,
        clearFilters
      }}>
      {children}
    </EngineConfigContext.Provider>
  );
};

EngineConfigContextProvider.propTypes = {
  children: PropTypes.element.isRequired
};

const useEngineConfigContext = () => useContext(EngineConfigContext);

export { EngineConfigContextProvider, EngineConfigContext, useEngineConfigContext };
