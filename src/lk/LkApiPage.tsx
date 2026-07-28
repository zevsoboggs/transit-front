import { Alert, Card, Space, Typography } from "antd";
import { ApiOutlined, KeyOutlined } from "@ant-design/icons";
import { CopyableText } from "../components/common";
import type { LkProfile } from "./clientApi";

const { Text, Paragraph, Link } = Typography;

const DOCS_URL =
  (import.meta.env.VITE_DOCS_URL as string) || "https://transit-api.tranzor.io/docs";

export function LkApiPage({ profile }: { profile: LkProfile }) {
  return (
    <Space direction="vertical" size={20} style={{ width: "100%" }}>
      <Card
        title={
          <Space>
            <KeyOutlined /> Ваш API-ключ
          </Space>
        }
      >
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="Ключ даёт полный доступ к вашему аккаунту. Не передавайте его третьим лицам."
        />
        <div style={{ wordBreak: "break-all", fontSize: 15 }}>
          <CopyableText value={profile.apiKey} />
        </div>
        <Paragraph type="secondary" style={{ marginTop: 12, marginBottom: 0 }}>
          Передавайте его в заголовке <Text code>X-API-KEY</Text> при запросах к API.
        </Paragraph>
      </Card>

      <Card
        title={
          <Space>
            <ApiOutlined /> Документация
          </Space>
        }
      >
        <Paragraph>
          Полное описание методов, схемы и «Try it out» — в интерактивной документации:
        </Paragraph>
        <Link href={DOCS_URL} target="_blank" rel="noreferrer">
          {DOCS_URL}
        </Link>
        <Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
          Базовые методы: получить баланс, депозитный адрес, заказать энергию, статус заказа
          (с хешем транзакции), история операций.
        </Paragraph>
      </Card>
    </Space>
  );
}
