import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { CustomerDashboardPage } from "@/pages/customer/CustomerDashboardPage";
import { MyDebtsPage } from "@/pages/customer/MyDebtsPage";
import { MyInvoiceDetailPage } from "@/pages/customer/MyInvoiceDetailPage";
import { MyInvoicesPage } from "@/pages/customer/MyInvoicesPage";
import { MyNotificationsPage } from "@/pages/customer/MyNotificationsPage";
import { MyPaymentDetailPage } from "@/pages/customer/MyPaymentDetailPage";
import { MyPaymentsPage } from "@/pages/customer/MyPaymentsPage";
import { MyProofsPage } from "@/pages/customer/MyProofsPage";
import { MyReceiptDetailPage } from "@/pages/customer/MyReceiptDetailPage";
import { MyReceiptsPage } from "@/pages/customer/MyReceiptsPage";
import { CustomerDetailPage } from "@/pages/manager/CustomerDetailPage";
import { CustomersPage } from "@/pages/manager/CustomersPage";
import { DebtDetailPage } from "@/pages/manager/DebtDetailPage";
import { DebtsPage } from "@/pages/manager/DebtsPage";
import { InvoiceCreatePage } from "@/pages/manager/InvoiceCreatePage";
import { InvoiceDetailPage } from "@/pages/manager/InvoiceDetailPage";
import { InvoicesPage } from "@/pages/manager/InvoicesPage";
import { ManagerDashboardPage } from "@/pages/manager/ManagerDashboardPage";
import { NotificationsPage } from "@/pages/manager/NotificationsPage";
import { PaymentDetailPage } from "@/pages/manager/PaymentDetailPage";
import { PaymentsPage } from "@/pages/manager/PaymentsPage";
import { ProductDetailPage } from "@/pages/manager/ProductDetailPage";
import { ProductsPage } from "@/pages/manager/ProductsPage";
import { ReceiptsPage } from "@/pages/manager/ReceiptsPage";
import { SettingsPage } from "@/pages/manager/SettingsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const managerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager",
  component: () => (
    <ProtectedRoute area="manager">
      <Outlet />
    </ProtectedRoute>
  ),
});

const managerIndexRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/",
  component: ManagerDashboardPage,
});

const managerCustomersRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/customers",
  component: CustomersPage,
});

const managerCustomerDetailRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/customers/$customerId",
  component: CustomerDetailPage,
});

const managerProductsRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/products",
  component: ProductsPage,
});

const managerProductDetailRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/products/$productId",
  component: ProductDetailPage,
});

const managerInvoicesRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/invoices",
  component: InvoicesPage,
});

const managerInvoiceCreateRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/invoices/new",
  component: InvoiceCreatePage,
});

const managerInvoiceDetailRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/invoices/$invoiceId",
  component: InvoiceDetailPage,
});

const managerPaymentsRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/payments",
  component: PaymentsPage,
});

const managerPaymentDetailRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/payments/$paymentId",
  component: PaymentDetailPage,
});

const managerProofsRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/proofs",
  component: PaymentsPage,
});

const managerDebtsRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/debts",
  component: DebtsPage,
});

const managerDebtDetailRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/debts/$customerId",
  component: DebtDetailPage,
});

const managerReceiptsRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/receipts",
  component: ReceiptsPage,
});

const managerNotificationsRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/notifications",
  component: NotificationsPage,
});

const managerSettingsRoute = createRoute({
  getParentRoute: () => managerRoute,
  path: "/settings",
  component: SettingsPage,
});

const customerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customer",
  component: () => (
    <ProtectedRoute area="customer">
      <Outlet />
    </ProtectedRoute>
  ),
});

const customerIndexRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: "/",
  component: CustomerDashboardPage,
});

const customerInvoicesRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: "/invoices",
  component: MyInvoicesPage,
});

const customerInvoiceDetailRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: "/invoices/$invoiceId",
  component: MyInvoiceDetailPage,
});

const customerProofsRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: "/proofs",
  component: MyProofsPage,
});

const customerPaymentsRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: "/payments",
  component: MyPaymentsPage,
});

const customerPaymentDetailRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: "/payments/$paymentId",
  component: MyPaymentDetailPage,
});

const customerReceiptsRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: "/receipts",
  component: MyReceiptsPage,
});

const customerReceiptDetailRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: "/receipts/$receiptId",
  component: MyReceiptDetailPage,
});

const customerDebtRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: "/debt",
  component: MyDebtsPage,
});

const customerNotificationsRoute = createRoute({
  getParentRoute: () => customerRoute,
  path: "/notifications",
  component: MyNotificationsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  managerRoute.addChildren([
    managerIndexRoute,
    managerCustomersRoute,
    managerCustomerDetailRoute,
    managerProductsRoute,
    managerProductDetailRoute,
    managerInvoicesRoute,
    managerInvoiceCreateRoute,
    managerInvoiceDetailRoute,
    managerPaymentsRoute,
    managerPaymentDetailRoute,
    managerProofsRoute,
    managerDebtsRoute,
    managerDebtDetailRoute,
    managerReceiptsRoute,
    managerNotificationsRoute,
    managerSettingsRoute,
  ]),
  customerRoute.addChildren([
    customerIndexRoute,
    customerInvoicesRoute,
    customerInvoiceDetailRoute,
    customerProofsRoute,
    customerPaymentsRoute,
    customerPaymentDetailRoute,
    customerReceiptsRoute,
    customerReceiptDetailRoute,
    customerDebtRoute,
    customerNotificationsRoute,
  ]),
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
