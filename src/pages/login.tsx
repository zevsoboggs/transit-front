import { useLogin } from "@refinedev/core";
import { Button, Card, Form, Input, Typography } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { AppTitle } from "../components/Title";

const { Title, Text } = Typography;

interface LoginValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const [form] = Form.useForm<LoginValues>();
  const { mutate: login, isLoading } = useLogin<LoginValues>();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 50% -10%, #dbeafe 0%, #f4f6fb 55%, #eef2f7 100%)",
      }}
    >
      <Card
        style={{ width: 420, maxWidth: "100%", boxShadow: "0 12px 40px rgba(15,23,42,.08)" }}
        styles={{ body: { padding: 32 } }}
      >
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <AppTitle />
        </div>
        <Title level={4} style={{ textAlign: "center", marginTop: 12, marginBottom: 4 }}>
          Вход в панель
        </Title>
        <Text
          type="secondary"
          style={{ display: "block", textAlign: "center", marginBottom: 24 }}
        >
          Управление транзитными кошельками
        </Text>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(values) => login(values)}
        >
          <Form.Item
            name="email"
            label="Электронная почта"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Некорректный email" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
              placeholder="you@example.com"
              size="large"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#94a3b8" }} />}
              placeholder="Ваш пароль"
              size="large"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
