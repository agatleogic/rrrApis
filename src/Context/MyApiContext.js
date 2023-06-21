import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  // ACTION_API_CONTENT,
  // ACTION_API_EXISTS,
  API_DELETE_FILE,
  // ACTION_API_LIST,
  API_EXECUTE_METHOD,
  API_FETCH_FILE_LIST,
  API_SAVE_FILE
} from "./Constants";
import { useAlertContext } from "./AlertContext";

const DEFAULT_FILTERS = {
  config: "",
  model: "",
  action: "",
  search: ""
};

const MyApiContext = createContext({
  fetchList: async () => {},
  // eslint-disable-next-line no-unused-vars
  fetchDetails: async (id) => {},
  // eslint-disable-next-line no-unused-vars
  save: async (data) => {},
  // eslint-disable-next-line no-unused-vars
  destroy: async () => {},
  // eslint-disable-next-line no-unused-vars
  exists: async (id) => {},
  list: [],
  currentDetails: null,
  fetching: false,
  deleting: false,
  filters: DEFAULT_FILTERS,
  // eslint-disable-next-line no-unused-vars
  setFilters: (values) => {},
  clearFilters: () => {}
});

const MyApiContextProvider = ({ children }) => {
  const [list, setList] = useState([]);
  const [currentDetails, setCurrentDetails] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const { setError } = useAlertContext();

  const fetchList = async () => {
    setFetching(true);
    try {
      const resp = await axios.post(API_FETCH_FILE_LIST, {}).then((resp) => resp.data);
      setList(resp);
      return resp;
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setFetching(false);
    }
  };

  const fetchDetails = async (id) => {
    setFetching(true);
    try {
      const resp = await axios
        .post(API_EXECUTE_METHOD, {
          // Actionname: ACTION_API_CONTENT,
          Filename: id
        })
        .then((resp) => resp.data);
      setCurrentDetails(resp);
      return resp;
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setFetching(false);
    }
  };

  const exists = async (id) => {
    setFetching(true);
    try {
      return await axios
        .post(API_EXECUTE_METHOD, {
          // Actionname: ACTION_API_EXISTS,
          Filename: id
        })
        .then((resp) => resp.data);
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setFetching(false);
    }
  };

  const save = async (data) => {
    setSaving(true);
    try {
      const resp = await axios
        .post(API_SAVE_FILE, {
          configName: data.config,
          filename: data.filename,
          json_text: JSON.stringify(data),
          model: data.model
        })
        .then((resp) => resp.data);
      setCurrentDetails(resp);
      return resp;
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (config, filePath) => {
    setDeleting(true);
    try {
      return await axios
        .post(API_DELETE_FILE, {
          configName: config,
          filePath
        })
        .then((resp) => resp.data);
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
  };

  return (
    <MyApiContext.Provider
      value={{
        fetching,
        list,
        currentDetails,
        saving,
        deleting,
        fetchList,
        fetchDetails,
        save,
        destroy,
        exists,
        filters,
        setFilters,
        clearFilters
      }}>
      {children}
    </MyApiContext.Provider>
  );
};

MyApiContextProvider.propTypes = {
  children: PropTypes.element.isRequired
};

const useMyApiContext = () => useContext(MyApiContext);

export { MyApiContext, MyApiContextProvider, useMyApiContext };
