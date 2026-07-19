import { useEffect } from "react";
import {
  Alert,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Typography,
  message,
} from "antd";
import { useCustomMutation, useInvalidate, useList, useUpdate } from "@refinedev/core";
import type { Network, Wallet } from "../types";
import { AddressText, NetworkTag } from "./common";

const { Text } = Typography;

function useNetworkCoins(network: string) {
  const { data } = useList<Network>({
    resource: "networks",
    pagination: { mode: "off" },
  });
  const found = data?.data.find((n) => n.network === network);
  return found?.coins ?? [];
}

function invalidateWallet(
  invalidate: ReturnType<typeof useInvalidate>,
  id: string,
) {
  invalidate({ resource: "wallets", invalidates: ["list", "detail"], id });
}

interface ModalProps {
  wallet: Wallet | null;
  open: boolean;
  onClose: () => void;
}

export function TopupModal({ wallet, open, onClose }: ModalProps) {
  const [form] = Form.useForm();
  const invalidate = useInvalidate();
  const { mutate, isLoading } = useCustomMutation();
  const coins = useNetworkCoins(wallet?.network ?? "");

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form, wallet?.id]);

  if (!wallet) return null;

  const onOk = () => {
    form.validateFields().then((values) => {
      mutate(
        {
          url: `wallets/${wallet.id}/topup`,
          method: "post",
          values,
          successNotification: false,
          errorNotification: false,
        },
        {
          onSuccess: () => {
            message.success("Пополнение отправлено с мастер-кошелька");
            invalidateWallet(invalidate, wallet.id);
            onClose();
          },
          onError: (e) => message.error(e?.message || "Не удалось пополнить"),
        },
      );
    });
  };

  return (
    <Modal
      title="Пополнить кошелёк"
      open={open}
      onOk={onOk}
      onCancel={onClose}
      okText="Пополнить"
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Перевод с мастер-кошелька на адрес этого транзита."
      />
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item label="Транзит">
          <AddressText address={wallet.address} />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Сумма"
          rules={[{ required: true, message: "Укажите сумму" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={1}
            placeholder="50"
          />
        </Form.Item>
        <Form.Item
          name="coin"
          label="Монета"
          extra="По умолчанию USDT сети кошелька."
        >
          <Select
            allowClear
            placeholder="USDT (по умолчанию)"
            options={coins.map((c) => ({ value: c.id, label: `${c.symbol} · #${c.id}` }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function TransferModal({ wallet, open, onClose }: ModalProps) {
  const [form] = Form.useForm();
  const invalidate = useInvalidate();
  const { mutate, isLoading } = useCustomMutation();
  const coins = useNetworkCoins(wallet?.network ?? "");

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form, wallet?.id]);

  if (!wallet) return null;

  const onOk = () => {
    form.validateFields().then((values) => {
      mutate(
        {
          url: `wallets/${wallet.id}/transfer`,
          method: "post",
          values,
          successNotification: false,
          errorNotification: false,
        },
        {
          onSuccess: () => {
            message.success("Перевод наружу отправлен");
            invalidateWallet(invalidate, wallet.id);
            onClose();
          },
          onError: (e) => message.error(e?.message || "Не удалось выполнить перевод"),
        },
      );
    });
  };

  return (
    <Modal
      title="Перевод наружу"
      open={open}
      onOk={onOk}
      onCancel={onClose}
      okText="Перевести"
      okButtonProps={{ danger: true }}
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="Средства уйдут с транзитного адреса на внешний адрес. Действие необратимо."
      />
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item label="Откуда">
          <AddressText address={wallet.address} />{" "}
          <NetworkTag network={wallet.network} label={wallet.networkLabel} />
        </Form.Item>
        <Form.Item
          name="coin"
          label="Монета"
          rules={[{ required: true, message: "Выберите монету" }]}
        >
          <Select
            placeholder="Выберите монету"
            options={coins.map((c) => ({ value: c.id, label: `${c.symbol} · #${c.id}` }))}
          />
        </Form.Item>
        <Form.Item
          name="toAddress"
          label="Адрес получателя"
          rules={[{ required: true, message: "Укажите адрес" }]}
        >
          <Input placeholder="T..." style={{ fontFamily: "ui-monospace, monospace" }} />
        </Form.Item>
        <Form.Item
          name="amount"
          label="Сумма"
          rules={[{ required: true, message: "Укажите сумму" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} step={1} placeholder="20" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export function RenameModal({ wallet, open, onClose }: ModalProps) {
  const [form] = Form.useForm();
  const { mutate, isLoading } = useUpdate();

  useEffect(() => {
    if (open) form.setFieldsValue({ label: wallet?.label ?? "" });
  }, [open, form, wallet?.id, wallet?.label]);

  if (!wallet) return null;

  const onOk = () => {
    form.validateFields().then((values) => {
      mutate(
        {
          resource: "wallets",
          id: wallet.id,
          values: { label: values.label },
          successNotification: () => ({
            type: "success",
            message: "Кошелёк переименован",
          }),
        },
        { onSuccess: () => onClose() },
      );
    });
  };

  return (
    <Modal
      title="Переименовать кошелёк"
      open={open}
      onOk={onOk}
      onCancel={onClose}
      okText="Сохранить"
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="label" label="Метка">
          <Input placeholder="Например: payout-1" maxLength={64} />
        </Form.Item>
        <Text type="secondary">ID: {wallet.id}</Text>
      </Form>
    </Modal>
  );
}
