import React, { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import PrimaryButton from "../Component/PrimaryButton";
import TextInput from "../Component/TextInput";
import Label from "../Component/Label";
import Layout from "../Layout";
import Select from "../Component/Select";
import {
  EngineConfigContextProvider,
  useEngineConfigContext
} from "../Context/EngineConfigContext";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "../Context/AuthContext";
import DangerButton from "../Component/DangerButton";
const ENGINE_OPTIONS = {
  Odoo: "Odoo"
};
const VERSION_OPTIONS = {
  "14.0": "14.0",
  "15.0": "15.0"
};

const EngineConfig = () => {
  const { fetchUserAttributes } = useAuthContext();
  const {
    fetchInfo,
    fetching,
    update,
    create,
    submitting,
    destroy,
    currentConfig,
    test,
    formValues,
    setFormValues,
    clearForm
  } = useEngineConfigContext();
  const { id } = useParams();
  const { t } = useTranslation("common");

  useEffect(() => {
    if (id) {
      fetchInfo(id);
      return () => {
        setFormValues({});
      };
    }
  }, [id]);

  const updateFormValue = (key, value) => {
    setFormValues({ ...formValues, [key]: value });
  };

  useEffect(() => {
    if (currentConfig) {
      setFormValues({
        name: currentConfig.name,
        type: currentConfig.type,
        version: currentConfig.version,
        database: currentConfig.database,
        url: currentConfig.url,
        username: currentConfig.username,
        password: currentConfig.password,
        description: currentConfig.description
      });
    }
  }, [currentConfig]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      await update(id, formValues);
    } else {
      await create(formValues);
    }
    await fetchUserAttributes();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure? You want to delete this engine configuration!")) {
      await destroy(id);
      await fetchUserAttributes();
    }
  };

  const testConfig = useCallback(async () => {
    const payload = {
      engineName: formValues.type,
      dbName: formValues.database,
      url: formValues.url,
      userName: formValues.username,
      token: formValues.password
    };
    await test(payload);
  }, [formValues, test]);

  return (
    <EngineConfigContextProvider>
      <Layout>
        <div className="flex flex-col items-center space-y-6">
          <h3 className="text-2xl font-medium text-center text-gray-700">
            {t("Engine Configuration")}
          </h3>
          {fetching ? <h6 className="text-sm text-gray-600">Fetching record...</h6> : ""}
          <form
            className="lg:grid lg:grid-cols-2 lg:gap-4 flex flex-col space-y-4 w-full max-w-screen-lg shadow bg-white p-8 rounded m-auto"
            onSubmit={handleSubmit}
            id="engineForm">
            <div className="flex lg:flex-row flex-col lg:items-center lg:space-x-2 space-y-2 lg:space-y-0">
              <div className="lg:w-4/12">
                <Label htmlFor="name">{t("Connection Name")}</Label>
              </div>
              <div className="lg:w-8/12">
                <TextInput
                  onChange={(value) => {
                    updateFormValue("name", value);
                  }}
                  disabled={fetching}
                  value={formValues.name}
                  id="name"
                  name="name"
                />
              </div>
            </div>
            <div className="flex lg:flex-row flex-col lg:items-center lg:space-x-2 space-y-2 lg:space-y-0">
              <div className="lg:w-4/12">
                <Label htmlFor="type">{t("Engine Type")}</Label>
              </div>
              <div className="lg:w-8/12">
                <div className="pr-10">
                  <Select
                    onChange={(value) => {
                      updateFormValue("type", value);
                    }}
                    disabled={fetching}
                    value={formValues.type}
                    options={Object.entries(ENGINE_OPTIONS)}
                    id="type"
                    name="type"
                  />
                </div>
              </div>
            </div>
            <div className="flex lg:flex-row flex-col lg:items-center lg:space-x-2 space-y-2 lg:space-y-0">
              <div className="lg:w-4/12">
                <Label htmlFor="database">{t("Database Name")}</Label>
              </div>
              <div className="lg:w-8/12">
                <TextInput
                  onChange={(value) => {
                    updateFormValue("database", value);
                  }}
                  disabled={fetching}
                  value={formValues.database}
                  id="databaseName"
                  name="databaseName"
                />
              </div>
            </div>
            <div className="flex lg:flex-row flex-col lg:items-center lg:space-x-2 space-y-2 lg:space-y-0">
              <div className="lg:w-4/12">
                <Label htmlFor="version">{t("Engine Version")}</Label>
              </div>
              <div className="lg:w-8/12">
                <div className="pr-10">
                  <Select
                    options={Object.entries(VERSION_OPTIONS)}
                    value={formValues.version}
                    onChange={(value) => {
                      updateFormValue("version", value);
                    }}
                    placeholder="Version"
                    name="version"
                    id="version"
                  />
                </div>
              </div>
            </div>
            <div className="flex lg:flex-row flex-col lg:items-center lg:space-x-2 space-y-2 lg:space-y-0">
              <div className="lg:w-4/12">
                <Label htmlFor="username">{t("Username")}</Label>
              </div>
              <div className="lg:w-8/12">
                <TextInput
                  onChange={(value) => {
                    updateFormValue("username", value);
                  }}
                  value={formValues.username}
                  id="username"
                  disabled={fetching}
                  name="username"
                />
              </div>
            </div>
            <div className="flex lg:flex-row flex-col lg:items-center lg:space-x-2 space-y-2 lg:space-y-0">
              <div className="lg:w-4/12">
                <Label htmlFor="url">{t("Engine URL")}</Label>
              </div>
              <div className="lg:w-8/12">
                <TextInput
                  onChange={(value) => {
                    updateFormValue("url", value);
                  }}
                  disabled={fetching}
                  value={formValues.url}
                  id="url"
                  name="url"
                />
              </div>
            </div>
            <div className="flex lg:flex-row flex-col lg:items-center lg:space-x-2 space-y-2 lg:space-y-0">
              <div className="lg:w-4/12">
                <Label htmlFor="password">{t("Authorization Key")}</Label>
              </div>
              <div className="lg:w-8/12">
                <TextInput
                  onChange={(value) => {
                    updateFormValue("password", value);
                  }}
                  disabled={fetching}
                  value={formValues.password}
                  id="password"
                  name="password"
                />
              </div>
            </div>
            <div className="flex lg:flex-row flex-col lg:items-center lg:space-x-2 space-y-2 lg:space-y-0">
              <div className="lg:w-4/12">
                <Label htmlFor="description">{t("Description")}</Label>
              </div>
              <div className="lg:w-8/12">
                <TextInput
                  onChange={(value) => {
                    updateFormValue("description", value);
                  }}
                  disabled={fetching}
                  value={formValues.description}
                  id="description"
                  name="description"
                />
              </div>
            </div>
            <div className="col-span-2 flex justify-center space-x-4 items-center">
              <PrimaryButton type="button" disabled={submitting} onClick={testConfig}>
                {t("Test")}
              </PrimaryButton>
              <PrimaryButton type="submit" disabled={submitting}>
                {t("Save")}
              </PrimaryButton>
              {id && (
                <DangerButton type="button" onClick={handleDelete} disabled={submitting}>
                  {t("Delete")}
                </DangerButton>
              )}
              <PrimaryButton type="button" onClick={clearForm}>
                {t("Clear")}
              </PrimaryButton>
            </div>
          </form>
        </div>
      </Layout>
    </EngineConfigContextProvider>
  );
};

export default EngineConfig;
