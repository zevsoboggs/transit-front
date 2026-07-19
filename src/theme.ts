import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";

// Modern, clean light theme.
export const lightTheme: ThemeConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#2563eb",
    colorInfo: "#2563eb",
    colorSuccess: "#16a34a",
    colorWarning: "#f59e0b",
    colorError: "#dc2626",
    borderRadius: 8,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    colorBgLayout: "#f4f6fb",
    colorTextBase: "#0f172a",
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      siderBg: "#ffffff",
      bodyBg: "#f4f6fb",
    },
    Menu: {
      itemSelectedBg: "#eef4ff",
      itemSelectedColor: "#2563eb",
      itemBorderRadius: 8,
    },
    Card: {
      borderRadiusLG: 14,
    },
    Button: {
      controlHeight: 36,
      fontWeight: 500,
    },
    Table: {
      headerBg: "#f8fafc",
      headerColor: "#64748b",
      rowHoverBg: "#f8fafc",
    },
  },
};
