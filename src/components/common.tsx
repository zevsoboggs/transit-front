import { useState } from "react";
import { Space, Tag, Tooltip, Typography, message } from "antd";
import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import type { Balance } from "../types";
import {
  copyToClipboard,
  formatAmount,
  networkColor,
  shortAddress,
} from "../utils/format";

const { Text } = Typography;

export function CopyableText({
  value,
  display,
  mono = true,
}: {
  value: string;
  display?: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (!value) return <Text type="secondary">—</Text>;

  const onCopy = async () => {
    await copyToClipboard(value);
    setCopied(true);
    message.success("Скопировано");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Space size={6}>
      <Text
        style={mono ? { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" } : undefined}
      >
        {display ?? value}
      </Text>
      <Tooltip title="Копировать">
        <a onClick={onCopy} style={{ color: copied ? "#16a34a" : undefined }}>
          {copied ? <CheckOutlined /> : <CopyOutlined />}
        </a>
      </Tooltip>
    </Space>
  );
}

export function AddressText({ address }: { address: string }) {
  return <CopyableText value={address} display={shortAddress(address)} />;
}

export function NetworkTag({
  network,
  label,
}: {
  network: string;
  label?: string;
}) {
  return (
    <Tag color={networkColor(network)} style={{ marginInlineEnd: 0 }}>
      {label ?? network.toUpperCase()}
    </Tag>
  );
}

export function BalanceTags({ balances }: { balances: Balance[] }) {
  if (!balances || balances.length === 0) {
    return <Text type="secondary">—</Text>;
  }
  return (
    <Space size={[4, 4]} wrap>
      {balances.map((b) => (
        <Tag
          key={b.key}
          color={b.isUsdt ? "green" : "default"}
          style={{ marginInlineEnd: 0 }}
        >
          {formatAmount(b.amount)} {b.shortName}
        </Tag>
      ))}
    </Space>
  );
}
