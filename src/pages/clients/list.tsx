import { useState } from "react";
import { useCustomMutation, useInvalidate, useList, useNavigation } from "@refinedev/core";
import { List } from "@refinedev/antd";
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  EyeOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import type { Client } from "../../types";
import { AddressText } from "../../components/common";
import { formatDateTime } from "../../utils/format";

const { Text } = Typography;

export function ClientList() {
  const { show } = useNavigation();
  const invalidate = useInvalidate();
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useList<Client>({
    resource: "clients",
    pagination: { mode: "off" },
  });
  const clients = data?.data ?? [];

  const { mutate: create, isLoading: creating } = useCustomMutation();
  const { mutate: setStatus } = useCustomMutation();

  const onCreate = () => {
    form.validateFields().then((v) => {
      create(
        {
          url: "clients",
          method: "post",
          values: v,
          successNotification: false,
          errorNotification: false,
        },
        {
          onSuccess: (res) => {
            const c = (res?.data as { client?: Client })?.client;
            message.success("Клиент создан, депозитный кошелёк выпущен");
            setCreateOpen(false);
            form.resetFields();
            invalidate({ resource: "clients", invalidates: ["list"] });
            if (c?.id) show("clients", c.id);
          },
          onError: (e) => message.error(e?.message || "Не удалось создать клиента"),
        },
      );
    });
  };

  const toggleStatus = (c: Client) => {
    const status = c.status === "active" ? "blocked" : "active";
    setStatus(
      {
        url: `clients/${c.id}/status`,
        method: "post",
        values: { status },
        successNotification: false,
        errorNotification: false,
      },
      {
        onSuccess: () => {
          message.success(status === "active" ? "Клиент разблокирован" : "Клиент заблокирован");
          invalidate({ resource: "clients", invalidates: ["list"] });
        },
        onError: (e) => message.error(e?.message || "Ошибка"),
      },
    );
  };

  return (
    <List
      title="Клиенты"
      headerButtons={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Новый клиент
        </Button>
      }
    >
      <Table dataSource={clients} loading={isLoading} rowKey="id" scroll={{ x: 800 }}>
        <Table.Column<Client> title="Клиент" dataIndex="name" render={(v) => <b>{v}</b>} />
        <Table.Column<Client>
          title="Депозитный адрес"
          dataIndex="depositAddress"
          render={(v: string | null) => (v ? <AddressText address={v} /> : <Text type="secondary">—</Text>)}
        />
        <Table.Column<Client>
          title="Баланс"
          dataIndex="balanceUsdt"
          align="right"
          render={(v: number) => (
            <b style={{ color: v > 0 ? "#16a34a" : undefined }}>${v.toFixed(2)}</b>
          )}
        />
        <Table.Column<Client>
          title="Статус"
          dataIndex="status"
          render={(s: string) =>
            s === "active" ? (
              <Tag color="success">активен</Tag>
            ) : (
              <Tag color="error">заблокирован</Tag>
            )
          }
        />
        <Table.Column<Client>
          title="Создан"
          dataIndex="createdAt"
          render={(v: string) => formatDateTime(v)}
        />
        <Table.Column<Client>
          title="Действия"
          key="actions"
          fixed="right"
          width={120}
          render={(_, r) => (
            <Space size={4}>
              <Tooltip title="Открыть">
                <Button size="small" icon={<EyeOutlined />} onClick={() => show("clients", r.id)} />
              </Tooltip>
              <Tooltip title={r.status === "active" ? "Заблокировать" : "Разблокировать"}>
                <Button
                  size="small"
                  danger={r.status === "active"}
                  icon={r.status === "active" ? <LockOutlined /> : <UnlockOutlined />}
                  onClick={() => toggleStatus(r)}
                />
              </Tooltip>
            </Space>
          )}
        />
      </Table>

      <Modal
        title="Новый клиент"
        open={createOpen}
        onOk={onCreate}
        onCancel={() => setCreateOpen(false)}
        okText="Создать"
        confirmLoading={creating}
        destroyOnClose
      >
        <Text type="secondary">
          При создании автоматически выпускается транзитный депозитный кошелёк для оплаты.
        </Text>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Имя клиента" rules={[{ required: true, message: "Укажите имя" }]}>
            <Input placeholder="Например: Acme LLC" maxLength={80} />
          </Form.Item>
          <Form.Item name="note" label="Заметка">
            <Input.TextArea placeholder="Необязательно" rows={2} maxLength={300} />
          </Form.Item>
        </Form>
      </Modal>
    </List>
  );
}
