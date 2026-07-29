import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Dropdown,
  Form,
  Grid,
  Input,
  Menu,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ApiOutlined,
  HistoryOutlined,
  KeyOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { clientApi, getToken, lkLogout, type LkProfile } from "./clientApi";
import { LkDashboard } from "./LkDashboard";
import { LkOrders } from "./LkOrders";
import { LkTransactions } from "./LkTransactions";
import { LkApiPage } from "./LkApiPage";

const { Text } = Typography;
const GAP = 12;

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 6px 24px rgba(15,23,42,.06)",
};

const TABS = [
  { key: "/lk", label: "Обзор", icon: <ThunderboltOutlined /> },
  { key: "/lk/orders", label: "Заказы", icon: <ProfileOutlined /> },
  { key: "/lk/history", label: "Пополнения", icon: <HistoryOutlined /> },
  { key: "/lk/api", label: "API", icon: <ApiOutlined /> },
];

export function LkApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<LkProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdForm] = Form.useForm();

  useEffect(() => setCollapsed(isMobile), [isMobile]);

  const load = useCallback(async () => {
    try {
      setProfile(await clientApi.me());
    } catch {
      lkLogout();
      navigate("/lk/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!getToken()) {
      navigate("/lk/login", { replace: true });
      return;
    }
    load();
  }, [load, navigate]);

  if (!getToken()) return <Navigate to="/lk/login" replace />;

  if (loading || !profile) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  const logout = () => {
    lkLogout();
    navigate("/lk/login", { replace: true });
  };

  const changePassword = () =>
    pwdForm.validateFields().then(async (v) => {
      setPwdSaving(true);
      try {
        await clientApi.changePassword(v.currentPassword, v.newPassword);
        message.success("Пароль изменён");
        setPwdOpen(false);
        pwdForm.resetFields();
      } catch (e) {
        message.error(e instanceof Error ? e.message : "Не удалось сменить пароль");
      } finally {
        setPwdSaving(false);
      }
    });

  const selected = TABS.reduce<string>(
    (acc, t) => (location.pathname === t.key || (t.key !== "/lk" && location.pathname.startsWith(t.key)) ? t.key : acc),
    "/lk",
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#eef2f7",
        display: "flex",
        gap: GAP,
        padding: GAP,
        alignItems: "flex-start",
        boxSizing: "border-box",
      }}
    >
      <aside
        style={{
          ...cardStyle,
          flex: "0 0 auto",
          width: collapsed ? 76 : 230,
          transition: "width .2s ease",
          overflow: "hidden",
          position: "sticky",
          top: GAP,
          height: `calc(100vh - ${GAP * 2}px)`,
        }}
      >
        <div style={{ padding: collapsed ? "18px 0" : "18px 18px 10px", textAlign: collapsed ? "center" : "left" }}>
          <Space size={10}>
            <ThunderboltOutlined style={{ color: "#2563eb", fontSize: 22 }} />
            {!collapsed && (
              <Text strong style={{ fontSize: 15, whiteSpace: "nowrap" }}>
                Кабинет партнёра
              </Text>
            )}
          </Space>
        </div>
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[selected]}
          onClick={(e) => navigate(e.key)}
          items={TABS.map((t) => ({ key: t.key, icon: t.icon, label: t.label }))}
          style={{ border: "none", background: "transparent" }}
        />
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: GAP }}>
        <div style={{ ...cardStyle, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px 0 8px" }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed((c) => !c)} />
          <Space>
            <Tag color="green" style={{ fontWeight: 600 }}>
              ${profile.balance.toFixed(2)}
            </Tag>
            <Dropdown
              menu={{
                items: [
                  { key: "pwd", icon: <KeyOutlined />, label: "Сменить пароль", onClick: () => setPwdOpen(true) },
                  { type: "divider" },
                  { key: "out", icon: <LogoutOutlined />, label: "Выйти", danger: true, onClick: logout },
                ],
              }}
            >
              <Space style={{ cursor: "pointer" }}>
                <Avatar size="small" icon={<UserOutlined />} style={{ background: "#2563eb" }} />
                <Text>{profile.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </div>

        <div style={{ ...cardStyle, flex: 1, minWidth: 0, padding: "20px 24px", minHeight: `calc(100vh - ${GAP * 3 + 60}px)` }}>
          <Routes>
            <Route index element={<LkDashboard profile={profile} onChange={load} />} />
            <Route path="orders" element={<LkOrders />} />
            <Route path="history" element={<LkTransactions />} />
            <Route path="api" element={<LkApiPage profile={profile} />} />
            <Route path="*" element={<Navigate to="/lk" replace />} />
          </Routes>
        </div>
      </div>

      <Modal
        title="Смена пароля"
        open={pwdOpen}
        onOk={changePassword}
        onCancel={() => setPwdOpen(false)}
        okText="Сохранить"
        confirmLoading={pwdSaving}
        destroyOnClose
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item
            name="currentPassword"
            label="Текущий пароль"
            rules={[{ required: true, message: "Введите текущий пароль" }]}
          >
            <Input.Password autoComplete="current-password" placeholder="Текущий пароль" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Новый пароль"
            rules={[{ required: true, min: 6, message: "Минимум 6 символов" }]}
            hasFeedback
          >
            <Input.Password autoComplete="new-password" placeholder="Новый пароль" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Повторите новый пароль"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Повторите пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                  return Promise.reject(new Error("Пароли не совпадают"));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" placeholder="Повторите новый пароль" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
