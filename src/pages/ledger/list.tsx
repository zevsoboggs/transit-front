import { useMemo, useState } from "react";
import { useList, useNavigation } from "@refinedev/core";
import { List } from "@refinedev/antd";
import {
  Button,
  Card,
  Col,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  EditOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { LedgerEntry, LedgerType } from "../../types";
import { AddressText, NetworkTag } from "../../components/common";
import { formatAmount, formatDateTime } from "../../utils/format";

const { Text } = Typography;

const TYPE_META: Record<
  LedgerType,
  { label: string; color: string; icon: React.ReactNode }
> = {
  issue: { label: "Выпуск", color: "blue", icon: <PlusCircleOutlined /> },
  topup: { label: "Пополнение", color: "green", icon: <DollarOutlined /> },
  transfer: { label: "Перевод", color: "volcano", icon: <SendOutlined /> },
  rename: { label: "Переименование", color: "default", icon: <EditOutlined /> },
};

export function LedgerList() {
  const { show } = useNavigation();
  const [type, setType] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  const { data, isLoading, refetch, isFetching } = useList<LedgerEntry>({
    resource: "ledger",
    pagination: { mode: "off" },
    filters: [
      ...(type ? [{ field: "type", operator: "eq" as const, value: type }] : []),
      ...(status ? [{ field: "status", operator: "eq" as const, value: status }] : []),
    ],
  });
  const entries = data?.data ?? [];

  const stats = useMemo(() => {
    let inCount = 0;
    let outCount = 0;
    let issued = 0;
    let errors = 0;
    for (const e of entries) {
      if (e.type === "issue" && e.status === "success") issued++;
      if (e.status === "error") errors++;
      if (e.status === "success" && e.direction === "in") inCount++;
      if (e.status === "success" && e.direction === "out") outCount++;
    }
    return { inCount, outCount, issued, errors };
  }, [entries]);

  return (
    <List
      title="Реестр операций"
      headerButtons={
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
          Обновить
        </Button>
      }
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Выпущено" value={stats.issued} prefix={<PlusCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Пополнений"
              value={stats.inCount}
              valueStyle={{ color: "#16a34a" }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Переводов"
              value={stats.outCount}
              valueStyle={{ color: "#dc2626" }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Ошибок"
              value={stats.errors}
              valueStyle={{ color: stats.errors ? "#dc2626" : undefined }}
            />
          </Card>
        </Col>
      </Row>

      <Space wrap style={{ marginBottom: 16 }}>
        <Segmented
          options={[
            { label: "Все типы", value: "" },
            { label: "Выпуск", value: "issue" },
            { label: "Пополнение", value: "topup" },
            { label: "Перевод", value: "transfer" },
            { label: "Переименование", value: "rename" },
          ]}
          value={type ?? ""}
          onChange={(v) => setType(v ? String(v) : undefined)}
        />
        <Select
          allowClear
          placeholder="Статус"
          style={{ width: 160 }}
          value={status}
          onChange={setStatus}
          options={[
            { value: "success", label: "Успех" },
            { value: "error", label: "Ошибка" },
          ]}
        />
      </Space>

      <Table
        dataSource={entries}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 25, showSizeChanger: true }}
      >
        <Table.Column<LedgerEntry>
          title="Время"
          dataIndex="ts"
          width={150}
          render={(v) => formatDateTime(v)}
        />
        <Table.Column<LedgerEntry>
          title="Операция"
          dataIndex="type"
          render={(t: LedgerType) => {
            const m = TYPE_META[t] ?? { label: t, color: "default", icon: null };
            return (
              <Tag color={m.color} icon={m.icon}>
                {m.label}
              </Tag>
            );
          }}
        />
        <Table.Column<LedgerEntry>
          title="Статус"
          dataIndex="status"
          render={(s: string) =>
            s === "success" ? (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                Успех
              </Tag>
            ) : (
              <Tag color="error" icon={<CloseCircleOutlined />}>
                Ошибка
              </Tag>
            )
          }
        />
        <Table.Column<LedgerEntry>
          title="Сумма"
          dataIndex="amount"
          align="right"
          render={(amount: number | null, r) => {
            if (amount == null) return <Text type="secondary">—</Text>;
            const isOut = r.direction === "out";
            return (
              <Text strong style={{ color: isOut ? "#dc2626" : "#16a34a" }}>
                {isOut ? "−" : "+"}
                {formatAmount(amount)} {r.coinSymbol ?? ""}
              </Text>
            );
          }}
        />
        <Table.Column<LedgerEntry>
          title="Сеть"
          dataIndex="network"
          render={(n: string | null) =>
            n ? <NetworkTag network={n} /> : <Text type="secondary">—</Text>
          }
        />
        <Table.Column<LedgerEntry>
          title="Кошелёк"
          dataIndex="address"
          render={(a: string | null, r) =>
            a ? (
              <Space size={4}>
                <AddressText address={a} />
                {r.walletId && (
                  <Tooltip title="Открыть кошелёк">
                    <a onClick={() => show("wallets", r.walletId!)}>↗</a>
                  </Tooltip>
                )}
              </Space>
            ) : (
              <Text type="secondary">—</Text>
            )
          }
        />
        <Table.Column<LedgerEntry>
          title="Получатель / детали"
          dataIndex="toAddress"
          render={(to: string | null, r) =>
            to ? (
              <AddressText address={to} />
            ) : r.detail ? (
              <Text type={r.status === "error" ? "danger" : undefined}>{r.detail}</Text>
            ) : (
              <Text type="secondary">—</Text>
            )
          }
        />
        <Table.Column<LedgerEntry>
          title="Кто"
          dataIndex="userEmail"
          render={(u: string | null) => u || <Text type="secondary">—</Text>}
        />
      </Table>
    </List>
  );
}
