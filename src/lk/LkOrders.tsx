import { useEffect, useState } from "react";
import { Button, Card, Table, Tag, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { clientApi, type LkOrder } from "./clientApi";
import { AddressText } from "../components/common";
import { formatAmount, formatDateTime } from "../utils/format";

const { Text } = Typography;

function statusTag(s: string) {
  const v = s.toLowerCase();
  if (/(success|done|complete|active|ok)/.test(v)) return <Tag color="success">выполнен</Tag>;
  if (/(fail|error|cancel|reject)/.test(v)) return <Tag color="error">ошибка</Tag>;
  return <Tag color="processing">{s}</Tag>;
}

export function LkOrders() {
  const [orders, setOrders] = useState<LkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    clientApi
      .orders()
      .then((r) => setOrders(r.orders))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <Card
      title="Мои заказы энергии"
      extra={
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading} size="small">
          Обновить
        </Button>
      }
    >
      <Table dataSource={orders} loading={loading} rowKey="id" scroll={{ x: 820 }} pagination={{ pageSize: 15 }}>
        <Table.Column<LkOrder> title="Время" dataIndex="ts" width={150} render={(v) => formatDateTime(v)} />
        <Table.Column<LkOrder> title="Длит." dataIndex="duration" render={(d) => <Tag color={d === "1h" ? "blue" : "purple"}>{d}</Tag>} />
        <Table.Column<LkOrder> title="Энергия" dataIndex="amount" align="right" render={(v: number) => <b>{formatAmount(v)}</b>} />
        <Table.Column<LkOrder>
          title="Стоимость"
          dataIndex="price"
          align="right"
          render={(v: number | null) => (v != null ? <b>${v.toFixed(4)}</b> : <Text type="secondary">—</Text>)}
        />
        <Table.Column<LkOrder> title="Получатель" dataIndex="receiveAddress" render={(v: string) => <AddressText address={v} />} />
        <Table.Column<LkOrder>
          title="Хеш транзакции"
          dataIndex="txHash"
          render={(v: string | null) => (v ? <AddressText address={v} /> : <Text type="secondary">—</Text>)}
        />
        <Table.Column<LkOrder> title="Статус" dataIndex="status" render={statusTag} />
      </Table>
    </Card>
  );
}
