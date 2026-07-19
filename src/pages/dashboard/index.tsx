import { useCustom, useList, useNavigation } from "@refinedev/core";
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  ReloadOutlined,
  WalletOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { MasterWallet, Wallet } from "../../types";
import { AddressText, BalanceTags, NetworkTag } from "../../components/common";
import { DailyQuotaMeter, useDailyQuota } from "../../components/DailyQuota";
import { formatDateTime } from "../../utils/format";

const { Title, Text } = Typography;

export function DashboardPage() {
  const { show, list } = useNavigation();
  const quota = useDailyQuota();

  const {
    data: masterData,
    isFetching: masterLoading,
    refetch: refetchMaster,
  } = useCustom<MasterWallet>({ url: "master", method: "get" });
  const master = masterData?.data;

  const { data: walletData, isLoading: walletsLoading } = useList<Wallet>({
    resource: "wallets",
    pagination: { mode: "off" },
  });
  const wallets = walletData?.data ?? [];

  const byNetwork = wallets.reduce<Record<string, number>>((acc, w) => {
    acc[w.network] = (acc[w.network] ?? 0) + 1;
    return acc;
  }, {});

  const recent = [...wallets]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6);

  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>
          Обзор
        </Title>
        <Text type="secondary">
          Транзитные кошельки, мастер-баланс и суточная квота выпуска
        </Text>
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <WalletOutlined />
                Мастер-кошелёк (фандинг)
              </Space>
            }
            extra={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetchMaster()}
                loading={masterLoading}
                size="small"
              >
                Обновить
              </Button>
            }
            style={{ height: "100%" }}
          >
            {master ? (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">Адрес</Text>
                    <div>
                      <AddressText address={master.address} />
                    </div>
                  </Col>
                  <Col span={6}>
                    <Statistic title="Wallet ID" value={master.walletId} />
                  </Col>
                  <Col span={6}>
                    <Text type="secondary">Сеть</Text>
                    <div>
                      <Tag color="red">{master.blockchain?.toUpperCase()}</Tag>
                    </div>
                  </Col>
                </Row>
                <div>
                  <Text type="secondary">Балансы</Text>
                  <div style={{ marginTop: 8 }}>
                    <BalanceTags balances={master.balances} />
                  </div>
                </div>
              </Space>
            ) : (
              <Empty description="Нет данных мастер-кошелька" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Суточная квота выпуска" style={{ height: "100%" }}>
            <DailyQuotaMeter
              issuedToday={quota.issuedToday}
              remaining={quota.remaining}
              percent={quota.percent}
              limit={quota.limit}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Всего кошельков"
              value={quota.total}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Выпущено сегодня"
              value={quota.issuedToday}
              suffix={`/ ${quota.limit}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Text type="secondary">По сетям</Text>
            <div style={{ marginTop: 8 }}>
              {Object.keys(byNetwork).length ? (
                <Space wrap>
                  {Object.entries(byNetwork).map(([net, cnt]) => (
                    <Tag key={net} color="blue">
                      {net.toUpperCase()}: {cnt}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary">—</Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Недавно выпущенные"
        extra={
          <Button type="link" onClick={() => list("wallets")}>
            Все кошельки <RightOutlined />
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={recent}
          loading={walletsLoading}
          pagination={false}
          size="middle"
          onRow={(record) => ({
            onClick: () => show("wallets", record.id),
            style: { cursor: "pointer" },
          })}
          columns={[
            {
              title: "Метка",
              dataIndex: "label",
              render: (v: string | null) => v || <Text type="secondary">—</Text>,
            },
            {
              title: "Сеть",
              dataIndex: "network",
              render: (_, r) => (
                <NetworkTag network={r.network} label={r.networkLabel} />
              ),
            },
            {
              title: "Адрес",
              dataIndex: "address",
              render: (v: string) => <AddressText address={v} />,
            },
            {
              title: "Проект",
              dataIndex: "project",
              render: (v: string | null) =>
                v ? <Tag>{v}</Tag> : <Text type="secondary">—</Text>,
            },
            {
              title: "Создан",
              dataIndex: "createdAt",
              render: (v: string) => formatDateTime(v),
            },
          ]}
        />
      </Card>
    </Space>
  );
}
