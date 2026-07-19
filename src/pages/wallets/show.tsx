import { useState } from "react";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  DollarOutlined,
  EditOutlined,
  ReloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { Wallet } from "../../types";
import { AddressText, BalanceTags, NetworkTag } from "../../components/common";
import {
  RenameModal,
  TopupModal,
  TransferModal,
} from "../../components/WalletActions";
import { WalletQr } from "../../components/WalletQr";
import { formatDateTime } from "../../utils/format";

const { Text, Title } = Typography;

type ActionKind = "topup" | "transfer" | "rename" | null;

export function WalletShow() {
  const { queryResult } = useShow<Wallet>({ resource: "wallets" });
  const { data, isLoading, refetch, isFetching } = queryResult;
  const wallet = data?.data;
  const [action, setAction] = useState<ActionKind>(null);
  const close = () => setAction(null);

  return (
    <Show
      isLoading={isLoading}
      title={wallet?.label || "Кошелёк"}
      headerButtons={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Обновить баланс
          </Button>
          <Button icon={<DollarOutlined />} onClick={() => setAction("topup")}>
            Пополнить
          </Button>
          <Button
            danger
            icon={<SendOutlined />}
            onClick={() => setAction("transfer")}
          >
            Перевести
          </Button>
          <Button icon={<EditOutlined />} onClick={() => setAction("rename")}>
            Переименовать
          </Button>
        </Space>
      }
    >
      {wallet && (
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={14}>
            <Card>
              <Descriptions column={1} bordered size="middle">
                <Descriptions.Item label="Метка">
                  {wallet.label || <Text type="secondary">—</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="Сеть">
                  <Space>
                    <NetworkTag network={wallet.network} label={wallet.networkLabel} />
                    {wallet.usdtNet && <Tag color="green">{wallet.usdtNet}</Tag>}
                    <Tag>{wallet.native}</Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Адрес">
                  <AddressText address={wallet.address} />
                </Descriptions.Item>
                <Descriptions.Item label="Wallet ID">
                  {wallet.walletId}
                </Descriptions.Item>
                <Descriptions.Item label="Проект">
                  {wallet.project ? (
                    <Tag>{wallet.project}</Tag>
                  ) : (
                    <Text type="secondary">—</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="UUID">
                  <AddressText address={wallet.id} />
                </Descriptions.Item>
                <Descriptions.Item label="Создан">
                  {formatDateTime(wallet.createdAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              title="Приём средств"
              style={{ height: "100%" }}
              styles={{ body: { textAlign: "center" } }}
            >
              <Space direction="vertical" size={16} align="center" style={{ width: "100%" }}>
                <WalletQr address={wallet.address} size={196} />
                <AddressText address={wallet.address} />
                <div style={{ width: "100%", borderTop: "1px dashed #e2e8f0", paddingTop: 16 }}>
                  <Text type="secondary">Текущий баланс</Text>
                  <Title level={4} style={{ margin: "8px 0 0" }}>
                    <BalanceTags balances={wallet.balances} />
                  </Title>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      <TopupModal wallet={wallet ?? null} open={action === "topup"} onClose={close} />
      <TransferModal
        wallet={wallet ?? null}
        open={action === "transfer"}
        onClose={close}
      />
      <RenameModal
        wallet={wallet ?? null}
        open={action === "rename"}
        onClose={close}
      />
    </Show>
  );
}
