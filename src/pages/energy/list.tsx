import { useMemo, useState } from "react";
import {
  useCustom,
  useCustomMutation,
  useInvalidate,
  useList,
} from "@refinedev/core";
import { List } from "@refinedev/antd";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  ReloadOutlined,
  ThunderboltOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import type { EnergyConfig, EnergyOrder } from "../../types";
import { AddressText } from "../../components/common";
import { WalletQr } from "../../components/WalletQr";
import { formatAmount, formatDateTime } from "../../utils/format";

const { Text, Paragraph } = Typography;

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (/(success|done|complete|delegat|active|ok)/.test(s)) return "success";
  if (/(pending|submit|process|wait|queue)/.test(s)) return "processing";
  if (/(fail|error|cancel|reject)/.test(s)) return "error";
  return "default";
}

export function EnergyList() {
  const [form] = Form.useForm();
  const invalidate = useInvalidate();
  const [duration, setDuration] = useState<"1h" | "5m">("1h");
  const [amount, setAmount] = useState<number>(65000);

  const { data: cfgData, isLoading: cfgLoading } = useCustom<EnergyConfig>({
    url: "energy/config",
    method: "get",
  });
  const cfg = cfgData?.data;

  const { data: ordersData, isLoading: ordersLoading, refetch, isFetching } =
    useList<EnergyOrder>({ resource: "energy-orders", pagination: { mode: "off" } });
  const orders = ordersData?.data ?? [];

  const { mutate: placeOrder, isLoading: placing } = useCustomMutation();
  const { mutate: checkOrder } = useCustomMutation();

  const priceSun = useMemo(() => {
    if (!cfg?.pricing) return null;
    return duration === "1h" ? cfg.pricing.priceSun1h : cfg.pricing.priceSun5m;
  }, [cfg, duration]);

  const estTrx = priceSun && amount ? (amount * priceSun) / 1_000_000 : null;
  const estUsd = estTrx && cfg?.pricing?.trxUsd ? estTrx * cfg.pricing.trxUsd : null;

  const min = cfg?.min ?? 61000;
  const max = cfg?.max ?? 3000000;

  const submit = () => {
    form.validateFields().then((v) => {
      placeOrder(
        {
          url: "energy/order",
          method: "post",
          values: { duration, amount: v.amount, receiveAddress: v.receiveAddress },
          successNotification: false,
          errorNotification: false,
        },
        {
          onSuccess: () => {
            message.success("Заказ на делегирование энергии отправлен");
            form.resetFields(["receiveAddress"]);
            invalidate({ resource: "energy-orders", invalidates: ["list"] });
          },
          onError: (e) => message.error(e?.message || "Не удалось создать заказ"),
        },
      );
    });
  };

  const check = (id: number) => {
    checkOrder(
      {
        url: `energy/orders/${id}/check`,
        method: "post",
        values: {},
        successNotification: false,
        errorNotification: false,
      },
      {
        onSuccess: (res) => {
          const st = (res?.data as { status?: string })?.status;
          message.info(st ? `Статус: ${st}` : "Статус обновлён");
          invalidate({ resource: "energy-orders", invalidates: ["list"] });
        },
        onError: (e) => message.error(e?.message || "Не удалось проверить статус"),
      },
    );
  };

  return (
    <List title="Делегирование энергии" breadcrumb={false}>
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <ThunderboltOutlined style={{ color: "#f59e0b" }} />
                Новое делегирование
              </Space>
            }
          >
            <Form form={form} layout="vertical" requiredMark="optional" initialValues={{ amount: 65000 }}>
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
                label={`Объём энергии (${formatAmount(min)}–${formatAmount(max)})`}
                rules={[
                  { required: true, message: "Укажите объём" },
                  {
                    type: "number",
                    min,
                    max,
                    message: `От ${formatAmount(min)} до ${formatAmount(max)}`,
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={min}
                  max={max}
                  step={1000}
                  onChange={(v) => setAmount(Number(v) || 0)}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                  parser={(v) => Number((v || "").replace(/\s/g, ""))}
                />
              </Form.Item>

              <Space wrap style={{ marginTop: -8, marginBottom: 16 }}>
                {[65000, 131000, 262000, 524000, 1000000].map((p) => (
                  <Button
                    key={p}
                    size="small"
                    onClick={() => {
                      form.setFieldValue("amount", p);
                      setAmount(p);
                    }}
                  >
                    {formatAmount(p)}
                  </Button>
                ))}
              </Space>

              <Form.Item
                name="receiveAddress"
                label="Адрес получателя (TRON)"
                rules={[
                  { required: true, message: "Укажите адрес" },
                  {
                    pattern: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
                    message: "Некорректный TRON-адрес",
                  },
                ]}
              >
                <Input placeholder="T..." style={{ fontFamily: "ui-monospace, monospace" }} />
              </Form.Item>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #eef2f7",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 16,
                }}
              >
                <Space split={<Divider type="vertical" />} wrap>
                  <Text type="secondary">
                    Цена:{" "}
                    <b>{priceSun != null ? `${priceSun} sun/энергия` : "—"}</b>
                  </Text>
                  <Text type="secondary">
                    Оценка: <b>{estTrx != null ? `≈ ${estTrx.toFixed(2)} TRX` : "—"}</b>
                    {estUsd != null ? ` (≈ $${estUsd.toFixed(2)})` : ""}
                  </Text>
                </Space>
              </div>

              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={placing}
                onClick={submit}
                size="large"
              >
                Делегировать энергию
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <WalletOutlined />
                Депозит энергобаланса
              </Space>
            }
            loading={cfgLoading}
            styles={{ body: { textAlign: "center" } }}
          >
            {cfg?.depositAddress && (
              <Space direction="vertical" size={14} align="center" style={{ width: "100%" }}>
                <WalletQr address={cfg.depositAddress} size={180} />
                <AddressText address={cfg.depositAddress} />
                <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 13 }}>
                  Пополните баланс делегирования, отправив USDT/TRX на этот адрес.
                </Paragraph>
              </Space>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title="История делегирований"
        style={{ marginTop: 20 }}
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} size="small">
            Обновить
          </Button>
        }
      >
        <Table
          dataSource={orders}
          loading={ordersLoading}
          rowKey="id"
          scroll={{ x: 820 }}
          pagination={{ pageSize: 15, showSizeChanger: true }}
        >
          <Table.Column<EnergyOrder>
            title="Время"
            dataIndex="ts"
            width={150}
            render={(v) => formatDateTime(v)}
          />
          <Table.Column<EnergyOrder>
            title="Длит."
            dataIndex="duration"
            render={(d) => <Tag color={d === "1h" ? "blue" : "purple"}>{d}</Tag>}
          />
          <Table.Column<EnergyOrder>
            title="Энергия"
            dataIndex="amount"
            align="right"
            render={(v: number) => <b>{formatAmount(v)}</b>}
          />
          <Table.Column<EnergyOrder>
            title="≈ TRX"
            dataIndex="estCostTrx"
            align="right"
            render={(v: number | null) =>
              v != null ? v.toFixed(2) : <Text type="secondary">—</Text>
            }
          />
          <Table.Column<EnergyOrder>
            title="Получатель"
            dataIndex="receiveAddress"
            render={(v: string) => <AddressText address={v} />}
          />
          <Table.Column<EnergyOrder>
            title="Статус"
            dataIndex="status"
            render={(s: string) => <Tag color={statusColor(s)}>{s}</Tag>}
          />
          <Table.Column<EnergyOrder>
            title=""
            key="actions"
            width={110}
            render={(_, r) =>
              r.providerOrderId ? (
                <Tooltip title="Проверить статус">
                  <Button size="small" icon={<ReloadOutlined />} onClick={() => check(r.id)}>
                    Статус
                  </Button>
                </Tooltip>
              ) : null
            }
          />
        </Table>
      </Card>
    </List>
  );
}
