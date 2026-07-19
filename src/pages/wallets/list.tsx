import { useMemo, useState } from "react";
import { useNavigation } from "@refinedev/core";
import { List, useTable } from "@refinedev/antd";
import {
  Button,
  Dropdown,
  Input,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
  QrcodeOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { Wallet } from "../../types";
import { AddressText, BalanceTags, NetworkTag } from "../../components/common";
import {
  RenameModal,
  TopupModal,
  TransferModal,
} from "../../components/WalletActions";
import { WalletQrModal } from "../../components/WalletQr";
import { DailyQuotaMeter, useDailyQuota } from "../../components/DailyQuota";
import { formatDateTime } from "../../utils/format";

const { Text } = Typography;

type ActionKind = "topup" | "transfer" | "rename" | "qr" | null;

export function WalletList() {
  const { create, show } = useNavigation();
  const quota = useDailyQuota();

  const [balances, setBalances] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<{ kind: ActionKind; wallet: Wallet | null }>(
    { kind: null, wallet: null },
  );

  const { tableProps, tableQueryResult } = useTable<Wallet>({
    resource: "wallets",
    pagination: { pageSize: 20 },
    meta: { balances },
    queryOptions: { keepPreviousData: true },
  });

  const rows = (tableProps.dataSource ?? []) as Wallet[];

  const projects = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((w) => w.project && set.add(w.project));
    return Array.from(set);
  }, [rows]);

  const [projectFilter, setProjectFilter] = useState<string | undefined>();
  const [networkFilter, setNetworkFilter] = useState<string | undefined>();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((w) => {
      if (projectFilter && w.project !== projectFilter) return false;
      if (networkFilter && w.network !== networkFilter) return false;
      if (!q) return true;
      return (
        w.address.toLowerCase().includes(q) ||
        (w.label ?? "").toLowerCase().includes(q) ||
        String(w.walletId).includes(q)
      );
    });
  }, [rows, search, projectFilter, networkFilter]);

  const close = () => setActive({ kind: null, wallet: null });

  return (
    <List
      title="Транзитные кошельки"
      headerButtons={
        <Tooltip
          title={
            quota.reached
              ? `Достигнут суточный лимит ${quota.limit}. Выпуск возобновится завтра.`
              : undefined
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={quota.reached}
            onClick={() => create("wallets")}
          >
            Выпустить кошелёк
          </Button>
        </Tooltip>
      }
    >
      <div
        style={{
          marginBottom: 16,
          padding: "12px 16px",
          background: "#f8fafc",
          border: "1px solid #eef2f7",
          borderRadius: 10,
          maxWidth: 420,
        }}
      >
        <DailyQuotaMeter
          issuedToday={quota.issuedToday}
          remaining={quota.remaining}
          percent={quota.percent}
          limit={quota.limit}
          compact
        />
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          allowClear
          placeholder="Адрес, метка или ID"
          style={{ width: 260 }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          allowClear
          placeholder="Сеть"
          style={{ width: 160 }}
          value={networkFilter}
          onChange={setNetworkFilter}
          options={[
            { value: "tron", label: "TRON" },
            { value: "bsc", label: "BNB Smart Chain" },
            { value: "eth", label: "Ethereum" },
            { value: "btc", label: "Bitcoin" },
          ]}
        />
        <Select
          allowClear
          placeholder="Проект"
          style={{ width: 220 }}
          value={projectFilter}
          onChange={setProjectFilter}
          options={projects.map((p) => ({ value: p, label: p }))}
        />
        <Space size={6}>
          <Switch
            checked={balances}
            onChange={setBalances}
            loading={tableQueryResult.isFetching}
          />
          <Text type="secondary">Живые балансы</Text>
        </Space>
      </Space>

      <Table
        {...tableProps}
        dataSource={filtered}
        rowKey="id"
        scroll={{ x: 900 }}
        pagination={{ ...tableProps.pagination, showSizeChanger: true }}
      >
        <Table.Column<Wallet>
          title="Метка"
          dataIndex="label"
          render={(v) => v || <Text type="secondary">—</Text>}
        />
        <Table.Column<Wallet>
          title="Сеть"
          dataIndex="network"
          render={(_, r) => <NetworkTag network={r.network} label={r.networkLabel} />}
        />
        <Table.Column<Wallet>
          title="Адрес"
          dataIndex="address"
          render={(v) => <AddressText address={v} />}
        />
        <Table.Column<Wallet>
          title="Проект"
          dataIndex="project"
          render={(v) => (v ? <Tag>{v}</Tag> : <Text type="secondary">—</Text>)}
        />
        {balances && (
          <Table.Column<Wallet>
            title="Балансы"
            dataIndex="balances"
            render={(_, r) => <BalanceTags balances={r.balances} />}
          />
        )}
        <Table.Column<Wallet>
          title="Создан"
          dataIndex="createdAt"
          sorter={(a, b) => (a.createdAt < b.createdAt ? -1 : 1)}
          render={(v) => formatDateTime(v)}
        />
        <Table.Column<Wallet>
          title="Действия"
          key="actions"
          fixed="right"
          width={130}
          render={(_, record) => (
            <Space size={4}>
              <Tooltip title="Открыть">
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => show("wallets", record.id)}
                />
              </Tooltip>
              <Tooltip title="QR-код">
                <Button
                  size="small"
                  icon={<QrcodeOutlined />}
                  onClick={() => setActive({ kind: "qr", wallet: record })}
                />
              </Tooltip>
              <Tooltip title="Пополнить">
                <Button
                  size="small"
                  icon={<DollarOutlined />}
                  onClick={() => setActive({ kind: "topup", wallet: record })}
                />
              </Tooltip>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "transfer",
                      icon: <SendOutlined />,
                      label: "Перевести наружу",
                    },
                    { key: "rename", icon: <EditOutlined />, label: "Переименовать" },
                  ],
                  onClick: ({ key }) =>
                    setActive({ kind: key as ActionKind, wallet: record }),
                }}
              >
                <Button size="small" icon={<MoreOutlined />} />
              </Dropdown>
            </Space>
          )}
        />
      </Table>

      <TopupModal
        wallet={active.wallet}
        open={active.kind === "topup"}
        onClose={close}
      />
      <TransferModal
        wallet={active.wallet}
        open={active.kind === "transfer"}
        onClose={close}
      />
      <RenameModal
        wallet={active.wallet}
        open={active.kind === "rename"}
        onClose={close}
      />
      <WalletQrModal
        wallet={active.wallet}
        open={active.kind === "qr"}
        onClose={close}
      />
    </List>
  );
}
