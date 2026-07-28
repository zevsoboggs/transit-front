import { useEffect, useState, type ReactNode } from "react";
import { useMenu } from "@refinedev/core";
import { Link } from "react-router-dom";
import { Grid, Layout, Menu } from "antd";
import { AppTitle } from "./Title";
import { HeaderUser } from "./HeaderUser";

const { Sider } = Layout;

export function AppLayout({ children }: { children: ReactNode }) {
  const { menuItems, selectedKey } = useMenu();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on small screens.
  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const items = menuItems.map((item) => ({
    key: item.key as string,
    icon: item.icon,
    label: item.route ? <Link to={item.route}>{item.label}</Link> : item.label,
  }));

  const gap = 12;

  return (
    <Layout style={{ minHeight: "100vh", background: "#eef2f7" }}>
      <div
        style={{
          display: "flex",
          gap,
          padding: gap,
          minHeight: "100vh",
          alignItems: "flex-start",
        }}
      >
        <Sider
          collapsed={collapsed}
          collapsible
          trigger={null}
          width={230}
          collapsedWidth={76}
          theme="light"
          style={{
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 6px 24px rgba(15,23,42,.06)",
            overflow: "hidden",
            position: "sticky",
            top: gap,
            height: `calc(100vh - ${gap * 2}px)`,
            flex: "0 0 auto",
          }}
        >
          <div style={{ padding: collapsed ? "16px 0" : "16px 18px 8px", textAlign: collapsed ? "center" : "left" }}>
            <AppTitle collapsed={collapsed} />
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={items}
            style={{ border: "none", background: "transparent", paddingInline: 8 }}
          />
        </Sider>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap,
          }}
        >
          <HeaderUser collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 6px 24px rgba(15,23,42,.06)",
              padding: "20px 24px",
              minHeight: `calc(100vh - ${gap * 2 + 60 + gap}px)`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </Layout>
  );
}
