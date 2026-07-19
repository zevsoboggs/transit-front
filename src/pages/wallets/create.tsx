import { useList, useNavigation } from "@refinedev/core";
import { Create, useForm } from "@refinedev/antd";
import {
  Alert,
  Col,
  Form,
  Input,
  Result,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import type { Network, Wallet } from "../../types";
import { DailyQuotaMeter, useDailyQuota } from "../../components/DailyQuota";

const { Text } = Typography;

export function WalletCreate() {
  const { list, show } = useNavigation();
  const quota = useDailyQuota();

  const { data: netData, isLoading: netLoading } = useList<Network>({
    resource: "networks",
    pagination: { mode: "off" },
  });
  const networks = netData?.data ?? [];

  const { formProps, saveButtonProps } = useForm<Wallet>({
    resource: "wallets",
    action: "create",
    redirect: false,
    onMutationSuccess: (data) => {
      const w = data?.data as Wallet | undefined;
      if (w?.id) show("wallets", w.id);
      else list("wallets");
    },
    successNotification: () => ({
      type: "success",
      message: "Кошелёк выпущен",
      description: "Транзитный адрес готов к использованию.",
    }),
  });

  if (quota.reached) {
    return (
      <Create
        title="Выпуск кошелька"
        saveButtonProps={{ style: { display: "none" } }}
        goBack={undefined}
      >
        <Result
          status="warning"
          title="Достигнут суточный лимит"
          subTitle={`За сутки уже выпущено ${quota.issuedToday} из ${quota.limit} кошельков. Выпуск станет доступен после сброса лимита.`}
        />
      </Create>
    );
  }

  return (
    <Create
      title="Выпуск транзитного кошелька"
      saveButtonProps={{ ...saveButtonProps, children: "Выпустить" }}
    >
      <Row gutter={24}>
        <Col xs={24} md={14}>
          <Form {...formProps} layout="vertical" requiredMark="optional">
            <Form.Item
              name="network"
              label="Сеть"
              rules={[{ required: true, message: "Выберите сеть" }]}
            >
              <Select
                loading={netLoading}
                placeholder="Выберите блокчейн-сеть"
                optionLabelProp="label"
                options={networks.map((n) => ({
                  value: n.network,
                  label: n.label,
                  data: n,
                }))}
                optionRender={(opt) => {
                  const n = (opt.data as { data: Network }).data;
                  return (
                    <Space>
                      <b>{n.label}</b>
                      {n.usdtNet && <Tag color="green">{n.usdtNet}</Tag>}
                      <Text type="secondary">
                        {n.coins.map((c) => c.symbol).join(", ")}
                      </Text>
                    </Space>
                  );
                }}
              />
            </Form.Item>

            <Form.Item name="label" label="Метка" extra="Понятное имя для поиска.">
              <Input placeholder="payout-1" maxLength={64} />
            </Form.Item>

            <Form.Item
              name="project"
              label="Проект"
              extra="Тег проекта для группировки кошельков."
            >
              <Input placeholder="proj2" maxLength={64} />
            </Form.Item>
          </Form>
        </Col>

        <Col xs={24} md={10}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Alert
              type="info"
              showIcon
              message="Приватные ключи хранятся на стороне API. Здесь вы получаете только адрес и идентификатор."
            />
            <div
              style={{
                padding: 16,
                background: "#f8fafc",
                border: "1px solid #eef2f7",
                borderRadius: 10,
              }}
            >
              <Text strong>Суточная квота</Text>
              <div style={{ marginTop: 12 }}>
                <DailyQuotaMeter
                  issuedToday={quota.issuedToday}
                  remaining={quota.remaining}
                  percent={quota.percent}
                  limit={quota.limit}
                  compact
                />
              </div>
            </div>
          </Space>
        </Col>
      </Row>
    </Create>
  );
}
