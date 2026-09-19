import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * Paths the app links to. TanStack Router throws when a `<Link to>` names a
 * route that is not in the tree, so every destination a tested component can
 * reach is registered here as an empty stub.
 */
const STUB_PATHS = [
  "/",
  "/login",
  "/manager",
  "/manager/customers",
  "/manager/customers/$customerId",
  "/manager/products",
  "/manager/products/$productId",
  "/manager/invoices",
  "/manager/invoices/new",
  "/manager/invoices/$invoiceId",
  "/manager/payments",
  "/manager/payments/$paymentId",
  "/manager/proofs",
  "/manager/debts",
  "/manager/debts/$customerId",
  "/manager/receipts",
  "/manager/notifications",
  "/manager/settings",
  "/customer",
  "/customer/invoices",
  "/customer/invoices/$invoiceId",
  "/customer/proofs",
  "/customer/payments",
  "/customer/payments/$paymentId",
  "/customer/receipts",
  "/customer/receipts/$receiptId",
  "/customer/debt",
  "/customer/notifications",
];

export interface RenderOptions {
  /** Initial URL for the memory router. */
  initialPath?: string;
  /** Extra route paths to register as stubs. */
  extraPaths?: string[];
  /**
   * Mount `ui` at this real route path instead of the synthetic `/__test__`.
   * Use it for a page that reads `useParams({ from: "<path>" })`, so the router
   * matches the same route the app registers. The path is removed from the stub
   * set to avoid a duplicate route.
   */
  uiPath?: string;
}

export interface RenderWithProvidersResult extends RenderResult {
  queryClient: QueryClient;
  router: ReturnType<typeof buildRouter>;
}

function buildRouter(ui: ReactNode, options: RenderOptions) {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });

  const uiPath = options.uiPath ?? "/__test__";
  const paths = [
    ...new Set([...STUB_PATHS, ...(options.extraPaths ?? [])]),
  ].filter((path) => path !== uiPath);
  const stubRoutes = paths.map((path) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path,
      component: () => null,
    }),
  );

  const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: uiPath,
    component: () => <>{ui}</>,
  });

  const routeTree = rootRoute.addChildren([...stubRoutes, testRoute]);
  const history = createMemoryHistory({
    initialEntries: [options.initialPath ?? uiPath],
  });
  return createRouter({ routeTree, history });
}

/**
 * Render a component inside the providers the app supplies at its root:
 * a fresh `QueryClient` (retries disabled so failures surface immediately) and
 * a memory-history router.
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {},
): RenderWithProvidersResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  const router = buildRouter(ui, options);

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { ...result, queryClient, router };
}
