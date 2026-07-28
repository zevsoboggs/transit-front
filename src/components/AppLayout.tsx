import { useEffect, useState, type ReactNode } from "react";
import { useMenu } from "@refinedev/core";
import { Link } from "react-router-dom";
import { Grid, Menu } from "antd";
import { AppTitle } from "./Title";
import { HeaderUser } from "./HeaderUser";

const GAP = 12;

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 6px 24px rgba(15,23,42,.06)",
};

export function AppLayout({ children }: { children: ReactNode }) {
  const { menuItems, selectedKey } = useMenu();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const items = menuItems.map((item) => ({
    key: item.key as string,
    icon: item.icon,
    label: item.route ? <Link to={item.route}>{item.label}</Link> : item.label,
  }));

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
        <div style={{ padding: collapsed ? "16px 0" : "16px 18px 8px", textAlign: collapsed ? "center" : "left" }}>
          <AppTitle collapsed={collapsed} />
        </div>
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={[selectedKey]}
          items={items}
          style={{ border: "none", background: "transparent" }}
        />
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: GAP }}>
        <HeaderUser collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div style={{ ...cardStyle, flex: 1, minWidth: 0, padding: "20px 24px", minHeight: `calc(100vh - ${GAP * 3 + 60}px)` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
