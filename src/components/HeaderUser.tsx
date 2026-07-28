import { useGetIdentity, useLogout } from "@refinedev/core";
import { Avatar, Button, Dropdown, Space, Typography } from "antd";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";

interface Identity {
  id: number;
  name: string;
  email: string;
}

export function HeaderUser({
  collapsed,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const { data: user } = useGetIdentity<Identity>();
  const { mutate: logout } = useLogout();

  return (
    <div
      style={{
        background: "#fff",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px 0 8px",
        borderRadius: 18,
        boxShadow: "0 6px 24px rgba(15,23,42,.06)",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
      />
      <Dropdown
        menu={{
          items: [
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Выйти",
              danger: true,
              onClick: () => logout(),
            },
          ],
        }}
      >
        <Space style={{ cursor: "pointer" }}>
          <Avatar size="small" icon={<UserOutlined />} style={{ background: "#2563eb" }} />
          <Typography.Text>{user?.name || user?.email || "Пользователь"}</Typography.Text>
        </Space>
      </Dropdown>
    </div>
  );
}
