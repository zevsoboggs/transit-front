import { AuthPage } from "@refinedev/antd";
import { Typography } from "antd";
import { AppTitle } from "../components/Title";

export function LoginPage() {
  return (
    <AuthPage
      type="login"
      registerLink={false}
      forgotPasswordLink={false}
      rememberMe={false}
      title={<AppTitle />}
      formProps={{
        initialValues: { email: "", password: "" },
      }}
      renderContent={(content) => (
        <div>
          {content}
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Панель управления транзитными кошельками
            </Typography.Text>
          </div>
        </div>
      )}
    />
  );
}
