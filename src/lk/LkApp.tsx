import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Dropdown, Layout, Menu, Space, Spin, Tag, Typography } from "antd";
import {
  ApiOutlined,
  HistoryOutlined,
  LogoutOutlined,
  ProfileOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { clientApi, getToken, lkLogout, type LkProfile } from "./clientApi";
import { LkDashboard } from "./LkDashboard";
import { LkOrders } from "./LkOrders";
import { LkTransactions } from "./LkTransactions";
import { LkApiPage } from "./LkApiPage";

const { Header, Content } = Layout;
const { Text } = Typography;

const TABS = [
  { key: "/lk", label: "Обзор", icon: <ThunderboltOutlined /> },
  { key: "/lk/orders", label: "Заказы", icon: <ProfileOutlined /> },
  { key: "/lk/history", label: "Пополнения", icon: <HistoryOutlined /> },
  { key: "/lk/api", label: "API", icon: <ApiOutlined /> },
];

export function LkApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<LkProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const selected = TABS.reduce(
    (acc, t) => (location.pathname === t.key || (t.key !== "/lk" && location.pathname.startsWith(t.key)) ? t.key : acc),
    "/lk",
  );

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f6fb" }}>
      <Header
        style={{
          background: "#fff",
          borderBottom: "1px solid #eef2f7",
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Space>
          <ThunderboltOutlined style={{ color: "#2563eb", fontSize: 22 }} />
          <Text strong style={{ fontSize: 16 }}>
            Кабинет партнёра
          </Text>
        </Space>
        <Menu
          mode="horizontal"
          selectedKeys={[selected]}
          onClick={(e) => navigate(e.key)}
          items={TABS.map((t) => ({ key: t.key, icon: t.icon, label: t.label }))}
          style={{ flex: 1, borderBottom: "none" }}
        />
        <Space>
          <Tag color="green" style={{ fontWeight: 600 }}>
            ${profile.balance.toFixed(2)}
          </Tag>
          <Dropdown
            menu={{ items: [{ key: "out", icon: <LogoutOutlined />, label: "Выйти", danger: true, onClick: logout }] }}
          >
            <Space style={{ cursor: "pointer" }}>
              <Avatar size="small" icon={<UserOutlined />} style={{ background: "#2563eb" }} />
              <Text>{profile.name}</Text>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ padding: 24, maxWidth: 1080, margin: "0 auto", width: "100%" }}>
        <Routes>
          <Route index element={<LkDashboard profile={profile} onChange={load} />} />
          <Route path="orders" element={<LkOrders />} />
          <Route path="history" element={<LkTransactions />} />
          <Route path="api" element={<LkApiPage profile={profile} />} />
          <Route path="*" element={<Navigate to="/lk" replace />} />
        </Routes>
      </Content>
    </Layout>
  );
}
