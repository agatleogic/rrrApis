import React, { useCallback, useState } from "react";
import Label from "../Component/Label";
import PrimaryButton from "../Component/PrimaryButton";
import TextInput from "../Component/TextInput";
import { useAuthContext } from "../Context/AuthContext";
import { useTranslation } from "react-i18next";
import Layout from "../Layout";
import { Link, useNavigate } from "react-router-dom";
import PasswordHelp from "../Component/PasswordHelp";
import { useAlertContext } from "../Context/AlertContext";

const Register = () => {
  // const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { submitting, register } = useAuthContext();
  const { t } = useTranslation("common");
  const { setSuccess } = useAlertContext();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      await register({ username: email, password, attributes: { email } });
      setSuccess(t("We have sent you an email for verify your account!"), true);
      navigate("/verify", { state: { email } });
    },
    [password, email]
  );

  return (
    <Layout>
      <div className="flex flex-col items-center justify-start h-full">
        <h1 className="text-xl font-medium mb-6">{t("Register")}</h1>
        <form className="border rounded p-6 shadow space-y-6 bg-white" onSubmit={handleSubmit}>
          {/* <div className="flex flex-col space-y-2">
            <Label htmlFor="username">{t("Username")}</Label>
            <TextInput value={username} onChange={setUsername} name="username" id="username" />
          </div> */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="username">{t("Email")}</Label>
            <TextInput type="email" value={email} onChange={setEmail} name="email" id="email" />
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Label htmlFor="password">{t("Password")}</Label>
              <PasswordHelp />
            </div>
            <TextInput
              value={password}
              onChange={setPassword}
              name="username"
              id="password"
              type="password"
            />
          </div>
          <div className="flex justify-between items-center">
            <Link to="/login">{t("Login instead?")}</Link>
            <PrimaryButton type="submit" disabled={submitting}>
              {t("Register")}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Register;
