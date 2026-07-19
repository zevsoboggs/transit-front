import { useGetIdentity, useLogout } from "@refinedev/core";
import { Avatar, Dropdown, Layout, Space, Typography } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";

interface Identity {
  id: number;
  name: string;
  email: string;
}

export function HeaderUser() {
  const { data: user } = useGetIdentity<Identity>();
  const { mutate: logout } = useLogout();

  return (
    <Layout.Header
      style={{
        background: "#fff",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        borderBottom: "1px solid #eef2f7",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
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
    </Layout.Header>
  );
}
