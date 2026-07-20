import { Authenticated, Refine } from "@refinedev/core";
import {
  ErrorComponent,
  ThemedLayoutV2,
  useNotificationProvider,
} from "@refinedev/antd";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { App as AntdApp, ConfigProvider } from "antd";
import {
  ApiOutlined,
  DashboardOutlined,
  ProfileOutlined,
  ThunderboltOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Outlet, Route, Routes } from "react-router-dom";

import "@refinedev/antd/dist/reset.css";

import { dataProvider } from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";
import { lightTheme } from "./theme";
import { AppTitle } from "./components/Title";
import { HeaderUser } from "./components/HeaderUser";
import { DashboardPage } from "./pages/dashboard";
import { WalletList } from "./pages/wallets/list";
import { WalletCreate } from "./pages/wallets/create";
import { WalletShow } from "./pages/wallets/show";
import { NetworkList } from "./pages/networks/list";
import { LedgerList } from "./pages/ledger/list";
import { EnergyList } from "./pages/energy/list";
import { LoginPage } from "./pages/login";

export default function App() {
  return (
    <ConfigProvider theme={lightTheme}>
      <AntdApp>
        <Refine
          dataProvider={dataProvider}
          authProvider={authProvider}
          routerProvider={routerBindings}
          notificationProvider={useNotificationProvider}
          resources={[
            {
              name: "dashboard",
              list: "/",
              meta: { label: "Обзор", icon: <DashboardOutlined /> },
            },
            {
              name: "wallets",
              list: "/wallets",
              create: "/wallets/create",
              show: "/wallets/show/:id",
              meta: { label: "Кошельки", icon: <WalletOutlined /> },
            },
            {
              name: "energy",
              list: "/energy",
              meta: { label: "Энергия", icon: <ThunderboltOutlined /> },
            },
            {
              name: "ledger",
              list: "/ledger",
              meta: { label: "Реестр", icon: <ProfileOutlined /> },
            },
            {
              name: "networks",
              list: "/networks",
              meta: { label: "Сети", icon: <ApiOutlined /> },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            disableTelemetry: true,
            title: { text: "Transit Wallets" },
          }}
        >
          <Routes>
            <Route
              element={
                <Authenticated
                  key="authenticated-routes"
                  fallback={<CatchAllNavigate to="/login" />}
                >
                  <ThemedLayoutV2
                    Title={({ collapsed }) => <AppTitle collapsed={collapsed} />}
                    Header={() => <HeaderUser />}
                  >
                    <Outlet />
                  </ThemedLayoutV2>
                </Authenticated>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="/wallets">
                <Route index element={<WalletList />} />
                <Route path="create" element={<WalletCreate />} />
                <Route path="show/:id" element={<WalletShow />} />
              </Route>
              <Route path="/energy" element={<EnergyList />} />
              <Route path="/ledger" element={<LedgerList />} />
              <Route path="/networks" element={<NetworkList />} />
              <Route path="*" element={<ErrorComponent />} />
            </Route>

            <Route
              element={
                <Authenticated key="auth-pages" fallback={<Outlet />}>
                  <NavigateToResource resource="dashboard" />
                </Authenticated>
              }
            >
              <Route path="/login" element={<LoginPage />} />
            </Route>
          </Routes>
          <UnsavedChangesNotifier />
          <DocumentTitleHandler
            handler={({ resource, action, pathname }) => {
              const app = "Transit Wallets";
              if (pathname === "/login") return `Вход · ${app}`;
              const label = (resource?.meta?.label as string) || undefined;
              const actionRu: Record<string, string> = {
                create: "Новый",
                edit: "Редактирование",
                show: "Просмотр",
                clone: "Копия",
              };
              if (label) {
                const prefix = action && actionRu[action] ? `${actionRu[action]} — ` : "";
                return `${prefix}${label} · ${app}`;
              }
              return app;
            }}
          />
        </Refine>
      </AntdApp>
    </ConfigProvider>
  );
}
