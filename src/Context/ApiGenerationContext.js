import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { API_GET_FIELDS_URI, API_GET_MODELS_URI } from "./Constants";
import { useAlertContext } from "./AlertContext";
import { useEngineConfigContext } from "./EngineConfigContext";
import { fieldOperatorsByType } from "./FieldProperties";

const ApiGenerationContext = createContext({
  submitting: false,
  fetching: false,
  models: [],
  modelRecords: [],
  fields: {},
  currentModel: null,
  selectedRecord: null,
  currentRecord: null,
  setCurrentModel: async () => {},
  setSelectedRecord: async () => {},
  fetchModels: async () => {},
  fetchModelRecords: async () => {},
  fetchRecords: async () => {},
  fetchAllRecords: async () => {},
  fetchFields: async () => {},
  fetchRecordById: async () => {},
  selectedFields: [],
  setSelectedFields: () => {},
  QBFields: [],
  setQBFields: () => {},
  filterFields: [],
  setFilterFields: () => {},
  requiredFields: [],
  setRequiredFields: () => {},
  fieldType: [],
  setFieldType: () => {},
  selectedMethod: "",
  setSelectedMethod: () => {},
  selectedConfig: null,
  setSelectedConfig: () => {},
  prevModel: null,
  setPrevModel: () => {},
  prevConfig: null,
  setPrevConfig: () => {},
  setModelRecords: () => {}
});

const ApiGenerationContextProvider = ({ children }) => {
  const { setCurrentConfig, currentConfig, list } = useEngineConfigContext();
  const [fetching, setFetching] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [models, setModels] = useState([]);
  const [modelRecords, setModelRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [fields, setFields] = useState({});
  const [selectedFields, setSelectedFields] = useState([]);
  const [completeQuery, setCompleteQuery] = useState([]);
  const [QBFields, setQBFields] = useState([]);
  const [filterFields, setFilterFields] = useState([]);
  const [requiredFields, setRequiredFields] = useState([]);
  const [fieldType, setFieldType] = useState({});
  const [selectedMethod, setSelectedMethod] = useState("");
  const [prevModel, setPrevModel] = useState(null);
  const [prevConfig, setPrevConfig] = useState(null);
  const { setError } = useAlertContext();

  useEffect(() => {
    setCurrentConfig(list.find(({ name }) => name === selectedConfig));
    setPrevConfig(selectedConfig);
  }, [selectedConfig]);

  useEffect(() => {
    let filteredFields = Object.entries(fields).filter(([, f]) => f.required);
    if (selectedFields.length === 0) {
      setSelectedFields(filteredFields.map(([name]) => name));
      setRequiredFields(filteredFields.map(([name]) => name));
      // "x_address": {"type": "string"}
      filteredFields.map(([name, f]) => (fieldType[name] = { type: f.type }));
      filteredFields.map(([name, f]) => {
        let ops = fieldOperatorsByType[f.type]
          ? { operators: fieldOperatorsByType[f.type].operators }
          : {};
        QBFields.push({
          ...ops,
          name: name,
          label: f.string,
          type: f.type,
          inputType: f.type == "boolean" ? "checkbox" : f.type == "integer" ? "number" : f.type,
          valueEditorType:
            f.type == "boolean" ? "checkbox" : f.type == "integer" ? "number" : f.type
        });
      });
      setFieldType(fieldType);
      console.log(QBFields);
      setQBFields(QBFields);
    }
  }, [fields]);

  const fetchModels = useCallback(async () => {
    if (selectedConfig && selectedConfig !== prevConfig) {
      setFetching(true);
      setModels([]);
      try {
        const models = await axios
          .post(API_GET_MODELS_URI, {
            configName: selectedConfig,
            model: "ir.model",
            fields: [["id", ">", 0]],
            outputrecords: { fields: ["display_name", "model"], limit: 1000 }
          })
          .then((resp) => resp.data);
        setModels(models || []);
      } catch (e) {
        setError(e.message);
        throw new Error(e.message);
      } finally {
        setFetching(false);
      }
    }
  }, [selectedConfig, prevConfig]);

  const fetchFields = useCallback(async () => {
    if (
      selectedConfig &&
      currentModel &&
      (currentModel !== prevModel || selectedConfig !== prevConfig)
    ) {
      console.log("fetching fields");
      setFields({});
      setFetching(true);
      try {
        const resp = await axios.post(API_GET_FIELDS_URI, {
          configName: selectedConfig,
          model: currentModel
        });
        setFields(resp.data || {});
      } catch (e) {
        setError(e.message);
        throw new Error(e.message);
      } finally {
        setFetching(false);
      }
    }
  }, [selectedConfig, currentModel, prevModel, prevConfig]);

  const fetchModelRecords = async (model, fields) => {
    setModelRecords([]);
    setFetching(true);
    try {
      setModelRecords(await fetchRecords(model, fields));
    } catch (e) {
      setError(e.message);
      throw new Error(e.message);
    } finally {
      setFetching(false);
    }
  };

  const fetchRecords = useCallback(
    async (model, fields = ["display_name", "id"]) => {
      if (selectedConfig) {
        return await axios
          .post(API_GET_MODELS_URI, {
            configName: selectedConfig,
            model,
            fields: [["id", ">", 0]],
            input: { fields },
            outputrecords: { fields, limit: 1000 }
          })
          .then((resp) => resp.data);
      }
      throw new Error("Engine Configuration is not selected!");
    },
    [selectedConfig]
  );

  const fetchAllRecords = useCallback(
    async (model) => {
      if (selectedConfig) {
        try {
          setFetching(true);
          return await axios
            .post(API_GET_MODELS_URI, {
              configName: selectedConfig,
              model,
              fields: completeQuery,
              outputrecords: { fields: [], limit: 1000 }
            })
            .then((resp) => resp.data);
        } catch (e) {
          setFetching(false);
          throw new Error("Engine Configuration is not selected!");
        } finally {
          setFetching(false);
        }
      }
    },
    [selectedConfig]
  );

  const fetchRecordById = useCallback(
    async (model, id) => {
      if (currentConfig) {
        try {
          setCurrentRecord(null);
          setFetching(true);
          const record = await axios
            .post(API_GET_MODELS_URI, {
              configName: currentConfig.name,
              model,
              fields: [["id", "=", id]],
              input: { limit: 1 },
              outputrecords: {}
            })
            .then((resp) => resp.data)
            .then((records) => records?.shift())
            .finally(() => {
              setFetching(false);
            });
          setCurrentRecord(record);
        } catch (e) {
          setError(e.message);
          throw new Error(e.message);
        } finally {
          setFetching(false);
        }
      }
    },
    [currentConfig]
  );

  return (
    <ApiGenerationContext.Provider
      value={{
        currentModel,
        fetching,
        models,
        fields,
        modelRecords,
        selectedRecord,
        currentRecord,
        fetchRecordById,
        fetchModels,
        fetchFields,
        setCurrentModel,
        fetchModelRecords,
        fetchRecords,
        fetchAllRecords,
        setSelectedRecord,
        selectedFields,
        setSelectedFields,
        completeQuery,
        setCompleteQuery,
        filterFields,
        setFilterFields,
        requiredFields,
        setRequiredFields,
        fieldType,
        setFieldType,
        QBFields,
        setQBFields,
        selectedMethod,
        setSelectedMethod,
        selectedConfig,
        setSelectedConfig,
        prevModel,
        setPrevModel,
        prevConfig,
        setPrevConfig,
        setModelRecords
      }}>
      {children}
    </ApiGenerationContext.Provider>
  );
};

ApiGenerationContextProvider.propTypes = {
  children: PropTypes.element.isRequired
};

const useApiGenerationContext = () => useContext(ApiGenerationContext);

export { ApiGenerationContextProvider, ApiGenerationContext, useApiGenerationContext };
