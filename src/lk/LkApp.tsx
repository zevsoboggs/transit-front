import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Button, Dropdown, Grid, Layout, Menu, Space, Spin, Tag, Typography } from "antd";
import {
  ApiOutlined,
  HistoryOutlined,
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

const { Sider } = Layout;
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
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<LkProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  const selected =
    TABS.reduce<string>(
      (acc, t) => (location.pathname === t.key || (t.key !== "/lk" && location.pathname.startsWith(t.key)) ? t.key : acc),
      "/lk",
    );

  const gap = 12;
  const card = {
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 6px 24px rgba(15,23,42,.06)",
  } as const;

  return (
    <Layout style={{ minHeight: "100vh", background: "#eef2f7" }}>
      <div style={{ display: "flex", gap, padding: gap, minHeight: "100vh", alignItems: "flex-start" }}>
        <Sider
          collapsed={collapsed}
          collapsible
          trigger={null}
          width={230}
          collapsedWidth={76}
          theme="light"
          style={{ ...card, overflow: "hidden", position: "sticky", top: gap, height: `calc(100vh - ${gap * 2}px)`, flex: "0 0 auto" }}
        >
          <div style={{ padding: collapsed ? "18px 0" : "18px 18px 10px", textAlign: collapsed ? "center" : "left" }}>
            <Space size={10}>
              <ThunderboltOutlined style={{ color: "#2563eb", fontSize: 22 }} />
              {!collapsed && <Text strong style={{ fontSize: 15, whiteSpace: "nowrap" }}>Кабинет партнёра</Text>}
            </Space>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selected]}
            onClick={(e) => navigate(e.key)}
            items={TABS.map((t) => ({ key: t.key, icon: t.icon, label: t.label }))}
            style={{ border: "none", background: "transparent", paddingInline: 8 }}
          />
        </Sider>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap }}>
          <div style={{ ...card, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px 0 8px" }}>
            <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed((c) => !c)} />
            <Space>
              <Tag color="green" style={{ fontWeight: 600 }}>${profile.balance.toFixed(2)}</Tag>
              <Dropdown menu={{ items: [{ key: "out", icon: <LogoutOutlined />, label: "Выйти", danger: true, onClick: logout }] }}>
                <Space style={{ cursor: "pointer" }}>
                  <Avatar size="small" icon={<UserOutlined />} style={{ background: "#2563eb" }} />
                  <Text>{profile.name}</Text>
                </Space>
              </Dropdown>
            </Space>
          </div>

          <div style={{ ...card, flex: 1, minWidth: 0, padding: "20px 24px", minHeight: `calc(100vh - ${gap * 3 + 60}px)` }}>
            <Routes>
              <Route index element={<LkDashboard profile={profile} onChange={load} />} />
              <Route path="orders" element={<LkOrders />} />
              <Route path="history" element={<LkTransactions />} />
              <Route path="api" element={<LkApiPage profile={profile} />} />
              <Route path="*" element={<Navigate to="/lk" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </Layout>
  );
}
