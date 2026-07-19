import { useList } from "@refinedev/core";
import { List } from "@refinedev/antd";
import { Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";
import type { Network } from "../../types";
import { networkColor } from "../../utils/format";

const { Text } = Typography;

export function NetworkList() {
  const { data, isLoading } = useList<Network>({
    resource: "networks",
    pagination: { mode: "off" },
  });
  const networks = data?.data ?? [];

  return (
    <List title="Доступные сети" canCreate={false}>
      <Row gutter={[20, 20]}>
        {networks.map((n) => (
          <Col xs={24} sm={12} lg={6} key={n.network}>
            <Card loading={isLoading} style={{ height: "100%" }}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Space>
                  <Tag color={networkColor(n.network)}>{n.network.toUpperCase()}</Tag>
                  <Text strong>{n.label}</Text>
                </Space>
                <Statistic
                  title="Нативная монета"
                  value={n.native}
                  valueStyle={{ fontSize: 20 }}
                />
                <div>
                  <Text type="secondary">Стандарт USDT</Text>
                  <div>
                    {n.usdtNet ? (
                      <Tag color="green">{n.usdtNet}</Tag>
                    ) : (
                      <Text type="secondary">не поддерживается</Text>
                    )}
                  </div>
                </div>
                <div>
                  <Text type="secondary">Монеты</Text>
                  <div style={{ marginTop: 6 }}>
                    <Space wrap size={[4, 4]}>
                      {n.coins.map((c) => (
                        <Tag key={c.id}>
                          {c.symbol} · #{c.id}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </List>
  );
}
