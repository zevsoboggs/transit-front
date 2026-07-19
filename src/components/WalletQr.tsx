import { QRCodeSVG } from "qrcode.react";
import { Modal, Space, Tag, Typography } from "antd";
import type { Wallet } from "../types";
import { CopyableText, NetworkTag } from "./common";

const { Text } = Typography;

export function WalletQr({
  address,
  size = 180,
}: {
  address: string;
  size?: number;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        padding: 14,
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
      }}
    >
      <QRCodeSVG value={address} size={size} level="M" bgColor="#ffffff" fgColor="#0f172a" />
    </div>
  );
}

export function WalletQrModal({
  wallet,
  open,
  onClose,
}: {
  wallet: Wallet | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!wallet) return null;
  return (
    <Modal
      title="QR-код адреса"
      open={open}
      onCancel={onClose}
      footer={null}
      width={360}
      destroyOnClose
    >
      <Space direction="vertical" align="center" size={16} style={{ width: "100%" }}>
        <Space>
          <NetworkTag network={wallet.network} label={wallet.networkLabel} />
          {wallet.usdtNet && <Tag color="green">{wallet.usdtNet}</Tag>}
          {wallet.label && <Text strong>{wallet.label}</Text>}
        </Space>
        <WalletQr address={wallet.address} size={220} />
        <div style={{ textAlign: "center" }}>
          <Text type="secondary">Адрес для пополнения</Text>
          <div style={{ marginTop: 4 }}>
            <CopyableText value={wallet.address} />
          </div>
        </div>
      </Space>
    </Modal>
  );
}
