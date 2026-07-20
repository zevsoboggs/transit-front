import { useState } from "react";
import { useCustom, useCustomMutation, useParsed } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DollarOutlined,
  KeyOutlined,
  ReloadOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import type { Client, ClientTransaction } from "../../types";
import { AddressText, CopyableText } from "../../components/common";
import { WalletQr } from "../../components/WalletQr";
import { formatDateTime } from "../../utils/format";

const { Text } = Typography;

const TX_META: Record<string, { label: string; color: string }> = {
  deposit: { label: "Депозит", color: "green" },
  charge: { label: "Списание", color: "volcano" },
  refund: { label: "Возврат", color: "blue" },
  adjust: { label: "Корректировка", color: "gold" },
};

export function ClientShow() {
  const { id } = useParsed();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [duration, setDuration] = useState<"1h" | "5m">("1h");
  const [adjustForm] = Form.useForm();
  const [orderForm] = Form.useForm();

  const { data, isLoading, refetch, isFetching } = useCustom<{
    client: Client;
    transactions: ClientTransaction[];
  }>({ url: `clients/${id}`, method: "get" });

  const client = data?.data.client;
  const transactions = data?.data.transactions ?? [];

  const { mutate, isLoading: acting } = useCustomMutation();

  const run = (
    url: string,
    values: Record<string, unknown>,
    okMsg: string,
    after?: () => void,
  ) =>
    mutate(
      { url, method: "post", values, successNotification: false, errorNotification: false },
      {
        onSuccess: () => {
          message.success(okMsg);
          refetch();
          after?.();
        },
        onError: (e) => message.error(e?.message || "Ошибка"),
      },
    );

  const sync = () =>
    mutate(
      { url: `clients/${id}/sync`, method: "post", values: {}, successNotification: false, errorNotification: false },
      {
        onSuccess: (res) => {
          const credited = (res?.data as { credited?: number })?.credited ?? 0;
          message.success(credited > 0 ? `Зачислено $${credited.toFixed(2)}` : "Новых поступлений нет");
          refetch();
        },
        onError: (e) => message.error(e?.message || "Ошибка"),
      },
    );

  const adjust = () =>
    adjustForm.validateFields().then((v) =>
      run(
        `clients/${id}/adjust`,
        { amount: v.amount, detail: v.detail },
        "Баланс изменён",
        () => {
          setAdjustOpen(false);
          adjustForm.resetFields();
        },
      ),
    );

  const order = () =>
    orderForm.validateFields().then((v) =>
      run(
        "energy/order",
        { duration, amount: v.amount, receiveAddress: v.receiveAddress, clientId: Number(id) },
        "Заказ энергии отправлен (списано с клиента)",
        () => {
          setOrderOpen(false);
          orderForm.resetFields();
        },
      ),
    );

  const rotate = () =>
    mutate(
      { url: `clients/${id}/rotate-key`, method: "post", values: {}, successNotification: false, errorNotification: false },
      {
        onSuccess: () => {
          message.success("API-ключ перевыпущен");
          refetch();
        },
        onError: (e) => message.error(e?.message || "Ошибка"),
      },
    );

  return (
    <Show
      isLoading={isLoading}
      title={client?.name || "Клиент"}
      headerButtons={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
            Обновить
          </Button>
          <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => setOrderOpen(true)}>
            Заказать энергию
          </Button>
        </Space>
      }
    >
      {client && (
        <>
          <Row gutter={[20, 20]}>
            <Col xs={24} md={8}>
              <Card style={{ height: "100%" }}>
                <Statistic
                  title="Баланс клиента"
                  value={client.balanceUsdt}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: client.balanceUsdt > 0 ? "#16a34a" : undefined, fontSize: 32 }}
                />
                {client.status === "blocked" && (
                  <Tag color="error" style={{ marginTop: 8 }}>
                    заблокирован
                  </Tag>
                )}
                <Space style={{ marginTop: 16 }} wrap>
                  <Button icon={<SyncOutlined />} onClick={sync} loading={acting}>
                    Проверить депозит
                  </Button>
                  <Button icon={<DollarOutlined />} onClick={() => setAdjustOpen(true)}>
                    Корректировать
                  </Button>
                </Space>
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Всего задепонировано: </Text>
                  <Text>${client.depositedTotalUsdt.toFixed(2)}</Text>
                </div>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card title="Депозитный адрес" styles={{ body: { textAlign: "center" } }} style={{ height: "100%" }}>
                {client.depositAddress && (
                  <Space direction="vertical" align="center" size={10} style={{ width: "100%" }}>
                    <WalletQr address={client.depositAddress} size={150} />
                    <AddressText address={client.depositAddress} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Клиент пополняет баланс, отправляя USDT сюда
                    </Text>
                  </Space>
                )}
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card
                title={
                  <Space>
                    <KeyOutlined /> API-ключ
                  </Space>
                }
                style={{ height: "100%" }}
              >
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message="Для доступа клиента к API. Держите в секрете."
                />
                <div style={{ wordBreak: "break-all", marginBottom: 12 }}>
                  <CopyableText value={client.apiKey} />
                </div>
                <Popconfirm
                  title="Перевыпустить ключ?"
                  description="Старый ключ перестанет работать."
                  onConfirm={rotate}
                  okText="Да"
                  cancelText="Отмена"
                >
                  <Button size="small" icon={<ReloadOutlined />}>
                    Перевыпустить
                  </Button>
                </Popconfirm>
              </Card>
            </Col>
          </Row>

          <Card title="История операций" style={{ marginTop: 20 }}>
            <Table dataSource={transactions} rowKey="id" scroll={{ x: 700 }} pagination={{ pageSize: 15 }}>
              <Table.Column<ClientTransaction> title="Время" dataIndex="ts" width={150} render={(v) => formatDateTime(v)} />
              <Table.Column<ClientTransaction>
                title="Тип"
                dataIndex="type"
                render={(t: string) => {
                  const m = TX_META[t] ?? { label: t, color: "default" };
                  return <Tag color={m.color}>{m.label}</Tag>;
                }}
              />
              <Table.Column<ClientTransaction>
                title="Сумма"
                dataIndex="amountUsdt"
                align="right"
                render={(v: number) => (
                  <b style={{ color: v < 0 ? "#dc2626" : "#16a34a" }}>
                    {v < 0 ? "−" : "+"}${Math.abs(v).toFixed(2)}
                  </b>
                )}
              />
              <Table.Column<ClientTransaction>
                title="Баланс после"
                dataIndex="balanceAfter"
                align="right"
                render={(v: number) => `$${v.toFixed(2)}`}
              />
              <Table.Column<ClientTransaction>
                title="Детали"
                dataIndex="detail"
                render={(v: string | null) => v || <Text type="secondary">—</Text>}
              />
              <Table.Column<ClientTransaction>
                title="Админ"
                dataIndex="adminEmail"
                render={(v: string | null) => v || <Text type="secondary">—</Text>}
              />
            </Table>
          </Card>
        </>
      )}

      <Modal
        title="Корректировка баланса"
        open={adjustOpen}
        onOk={adjust}
        onCancel={() => setAdjustOpen(false)}
        okText="Применить"
        confirmLoading={acting}
        destroyOnClose
      >
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Положительная сумма — пополнение, отрицательная — списание."
        />
        <Form form={adjustForm} layout="vertical">
          <Form.Item name="amount" label="Сумма (USDT)" rules={[{ required: true, message: "Укажите сумму" }]}>
            <InputNumber style={{ width: "100%" }} step={1} placeholder="Напр. 50 или -10" />
          </Form.Item>
          <Form.Item name="detail" label="Комментарий">
            <Input placeholder="Причина корректировки" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Заказать энергию для клиента"
        open={orderOpen}
        onOk={order}
        onCancel={() => setOrderOpen(false)}
        okText="Делегировать"
        confirmLoading={acting}
        destroyOnClose
      >
        <Form form={orderForm} layout="vertical" initialValues={{ amount: 65000 }}>
          <Form.Item label="Длительность">
            <Segmented
              value={duration}
              onChange={(v) => setDuration(v as "1h" | "5m")}
              options={[
                { label: "1 час", value: "1h" },
                { label: "5 минут", value: "5m" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Объём энергии"
            rules={[{ required: true, type: "number", min: 61000, max: 3000000, message: "61 000–3 000 000" }]}
          >
            <InputNumber style={{ width: "100%" }} min={61000} max={3000000} step={1000} />
          </Form.Item>
          <Form.Item
            name="receiveAddress"
            label="Адрес получателя (TRON)"
            rules={[
              { required: true, message: "Укажите адрес" },
              { pattern: /^T[1-9A-HJ-NP-Za-km-z]{33}$/, message: "Некорректный TRON-адрес" },
            ]}
          >
            <Input placeholder="T..." style={{ fontFamily: "ui-monospace, monospace" }} />
          </Form.Item>
          <Text type="secondary">Стоимость спишется с баланса клиента (${client?.balanceUsdt.toFixed(2)}).</Text>
        </Form>
      </Modal>
    </Show>
  );
}
