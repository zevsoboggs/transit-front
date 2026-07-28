import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { LockOutlined, MailOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { clientApi, LkError } from "./clientApi";

const { Title, Text } = Typography;

export function LkLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (v: { email: string; password: string }) => {
    setLoading(true);
    try {
      await clientApi.login(v.email, v.password);
      navigate("/lk", { replace: true });
    } catch (e) {
      message.error(e instanceof LkError ? e.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "radial-gradient(1200px 600px at 50% -10%, #dbeafe 0%, #f4f6fb 55%, #eef2f7 100%)",
      }}
    >
      <Card style={{ width: 400, maxWidth: "100%", boxShadow: "0 12px 40px rgba(15,23,42,.08)" }} styles={{ body: { padding: 32 } }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <ThunderboltOutlined style={{ fontSize: 34, color: "#2563eb" }} />
        </div>
        <Title level={4} style={{ textAlign: "center", marginTop: 8, marginBottom: 4 }}>
          Кабинет партнёра
        </Title>
        <Text type="secondary" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
          Покупка энергии TRON
        </Text>
        <Form layout="vertical" requiredMark={false} onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Электронная почта"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Некорректный email" },
            ]}
          >
            <Input prefix={<MailOutlined style={{ color: "#94a3b8" }} />} placeholder="you@example.com" size="large" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true, message: "Введите пароль" }]}>
            <Input.Password prefix={<LockOutlined style={{ color: "#94a3b8" }} />} placeholder="Ваш пароль" size="large" autoComplete="current-password" />
          </Form.Item>
          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Войти
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: 12 }}>
          Доступ выдаёт менеджер
        </Text>
      </Card>
    </div>
  );
}
