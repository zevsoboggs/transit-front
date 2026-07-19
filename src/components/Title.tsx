import { Space, Typography } from "antd";

export function AppTitle({ collapsed }: { collapsed?: boolean }) {
  return (
    <Space size={10} style={{ padding: "4px 0" }}>
      <img src="/wallet.svg" width={30} height={30} alt="logo" />
      {!collapsed && (
        <Typography.Text strong style={{ fontSize: 16, whiteSpace: "nowrap" }}>
          Transit&nbsp;<span style={{ color: "#2563eb" }}>Wallets</span>
        </Typography.Text>
      )}
    </Space>
  );
}
