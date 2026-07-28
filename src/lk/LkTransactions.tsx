import { useEffect, useState } from "react";
import { Button, Card, Table, Tag, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { clientApi, type LkTransaction } from "./clientApi";
import { formatDateTime } from "../utils/format";

const { Text } = Typography;

const TYPE_META: Record<string, { label: string; color: string }> = {
  deposit: { label: "Пополнение", color: "green" },
  charge: { label: "Списание", color: "volcano" },
  refund: { label: "Возврат", color: "blue" },
  adjust: { label: "Корректировка", color: "gold" },
};

export function LkTransactions() {
  const [tx, setTx] = useState<LkTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    clientApi
      .transactions()
      .then((r) => setTx(r.transactions))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <Card
      title="История баланса"
      extra={
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading} size="small">
          Обновить
        </Button>
      }
    >
      <Table dataSource={tx} loading={loading} rowKey="id" scroll={{ x: 640 }} pagination={{ pageSize: 20 }}>
        <Table.Column<LkTransaction> title="Время" dataIndex="ts" width={150} render={(v) => formatDateTime(v)} />
        <Table.Column<LkTransaction>
          title="Тип"
          dataIndex="type"
          render={(t: string) => {
            const m = TYPE_META[t] ?? { label: t, color: "default" };
            return <Tag color={m.color}>{m.label}</Tag>;
          }}
        />
        <Table.Column<LkTransaction>
          title="Сумма"
          dataIndex="amount"
          align="right"
          render={(v: number) => (
            <b style={{ color: v < 0 ? "#dc2626" : "#16a34a" }}>
              {v < 0 ? "−" : "+"}${Math.abs(v).toFixed(4)}
            </b>
          )}
        />
        <Table.Column<LkTransaction>
          title="Баланс после"
          dataIndex="balance"
          align="right"
          render={(v: number) => `$${v.toFixed(2)}`}
        />
        <Table.Column<LkTransaction>
          title="Детали"
          dataIndex="detail"
          render={(v: string | null) => v || <Text type="secondary">—</Text>}
        />
      </Table>
    </Card>
  );
}
