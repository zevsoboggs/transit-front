import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Segmented,
  Space,
  Statistic,
  Typography,
  message,
} from "antd";
import { ThunderboltOutlined, WalletOutlined } from "@ant-design/icons";
import { clientApi, LkError, type LkProfile } from "./clientApi";
import { AddressText } from "../components/common";
import { WalletQr } from "../components/WalletQr";

const { Text, Paragraph } = Typography;

export function LkDashboard({ profile, onChange }: { profile: LkProfile; onChange: () => void }) {
  const [form] = Form.useForm();
  const [duration, setDuration] = useState<"1h" | "5m">("1h");
  const [placing, setPlacing] = useState(false);
  const [result, setResult] = useState<{ txHash: string | null; price: number | null; balance: number } | null>(null);

  const submit = () => {
    form.validateFields().then(async (v) => {
      setPlacing(true);
      try {
        const r = await clientApi.order({ duration, amount: v.amount, receiveAddress: v.receiveAddress });
        setResult({ txHash: r.txHash, price: r.price, balance: r.balance });
        form.resetFields(["receiveAddress"]);
        onChange();
      } catch (e) {
        message.error(e instanceof LkError ? e.message : "Не удалось создать заказ");
      } finally {
        setPlacing(false);
      }
    });
  };

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Row gutter={[20, 20]}>
        <Col xs={24} md={10}>
          <Card style={{ height: "100%" }}>
            <Statistic
              title="Баланс"
              value={profile.balance}
              precision={2}
              prefix="$"
              valueStyle={{ color: profile.balance > 0 ? "#16a34a" : undefined, fontSize: 34 }}
            />
            <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
              Минимальный депозит — <b>{profile.minDeposit} USDT</b>.
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={14}>
          <Card
            title={
              <Space>
                <WalletOutlined /> Пополнение баланса
              </Space>
            }
            style={{ height: "100%" }}
          >
            <Row gutter={16} align="middle">
              <Col flex="none">
                <WalletQr address={profile.depositAddress} size={120} />
              </Col>
              <Col flex="auto">
                <Text type="secondary">Адрес депозита (USDT · {profile.network.toUpperCase()})</Text>
                <div style={{ marginTop: 6 }}>
                  <AddressText address={profile.depositAddress} />
                </div>
                <Paragraph type="secondary" style={{ marginTop: 10, marginBottom: 0, fontSize: 13 }}>
                  Отправьте USDT-TRC20 на этот адрес. Баланс пополняется от {profile.minDeposit} USDT.
                </Paragraph>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: "#f59e0b" }} /> Заказать энергию
          </Space>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional" initialValues={{ amount: 65000 }}>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label="Длительность">
                <Segmented
                  block
                  value={duration}
                  onChange={(v) => setDuration(v as "1h" | "5m")}
                  options={[
                    { label: "1 час", value: "1h" },
                    { label: "5 мин", value: "5m" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="amount"
                label="Объём энергии"
                rules={[{ required: true, type: "number", min: 61000, max: 3000000, message: "61 000–3 000 000" }]}
              >
                <InputNumber<number>
                  style={{ width: "100%" }}
                  min={61000}
                  max={3000000}
                  step={1000}
                  formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                  parser={(v) => Number((v || "").replace(/\s/g, ""))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label=" ">
                <Button type="primary" icon={<ThunderboltOutlined />} onClick={submit} loading={placing} block size="large">
                  Купить энергию
                </Button>
              </Form.Item>
            </Col>
          </Row>
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
        </Form>
      </Card>

      <Modal
        open={!!result}
        title="Энергия делегирована ✅"
        onCancel={() => setResult(null)}
        footer={<Button type="primary" onClick={() => setResult(null)}>Готово</Button>}
      >
        {result && (
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <Alert type="success" showIcon message="Заказ выполнен, энергия делегирована." />
            <div>
              <Text type="secondary">Хеш транзакции</Text>
              <div>{result.txHash ? <AddressText address={result.txHash} /> : "—"}</div>
            </div>
            <Space size={40}>
              <Statistic title="Списано" value={result.price ?? 0} precision={4} prefix="$" />
              <Statistic title="Остаток" value={result.balance} precision={2} prefix="$" />
            </Space>
          </Space>
        )}
      </Modal>
    </Space>
  );
}
