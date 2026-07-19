import { useList } from "@refinedev/core";
import { Progress, Space, Statistic, Typography } from "antd";
import type { Wallet } from "../types";
import { DAILY_LIMIT, countIssuedToday } from "../utils/format";

const { Text } = Typography;

export function useDailyQuota() {
  const { data, isLoading, refetch } = useList<Wallet>({
    resource: "wallets",
    pagination: { mode: "off" },
  });
  const wallets = data?.data ?? [];
  const issuedToday = countIssuedToday(wallets);
  const remaining = Math.max(0, DAILY_LIMIT - issuedToday);
  const percent = Math.min(100, Math.round((issuedToday / DAILY_LIMIT) * 100));
  const reached = issuedToday >= DAILY_LIMIT;
  return {
    isLoading,
    refetch,
    total: wallets.length,
    issuedToday,
    remaining,
    percent,
    reached,
    limit: DAILY_LIMIT,
  };
}

function statusColor(percent: number): string {
  if (percent >= 100) return "#dc2626";
  if (percent >= 80) return "#f59e0b";
  return "#2563eb";
}

export function DailyQuotaMeter({
  issuedToday,
  remaining,
  percent,
  limit,
  compact = false,
}: {
  issuedToday: number;
  remaining: number;
  percent: number;
  limit: number;
  compact?: boolean;
}) {
  const color = statusColor(percent);

  if (compact) {
    return (
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Text type="secondary">
          Выпущено сегодня: <b style={{ color }}>{issuedToday}</b> / {limit}
        </Text>
        <Progress
          percent={percent}
          strokeColor={color}
          size="small"
          format={() => `${remaining} осталось`}
        />
      </Space>
    );
  }

  return (
    <Space size={32} align="center" wrap>
      <Progress
        type="dashboard"
        percent={percent}
        strokeColor={color}
        format={() => (
          <span style={{ fontSize: 20, fontWeight: 600, color }}>
            {issuedToday}
          </span>
        )}
        size={140}
      />
      <Space direction="vertical" size={16}>
        <Statistic title="Лимит в сутки" value={limit} />
        <Statistic
          title="Осталось выпустить"
          value={remaining}
          valueStyle={{ color }}
        />
      </Space>
    </Space>
  );
}
