import paths from "@/config/routes";
import { lazy } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";
import adminRoutes from "./admin.routes";
import staffRoutes from "./staff.routes";
import SharedLayout from "@/components/common/layout";

const Home = lazy(() => import("@/components/error/home"));
const Login = lazy(() => import("@/features/auth/pages/login"));
const Error = lazy(() => import("@/components/error/error"));
const Unknown = lazy(() => import("@/components/error/unknown"));
const Page404 = lazy(() => import("@/components/error/404"));
const Unauthorized = lazy(() => import("@/components/error/unauthorized"));

const routes: RouteObject[] = [
  {
    errorElement: <Error />,
    element: <SharedLayout />,
    children: [
      {
        path: paths.public.index.href,
        element: <Home />,
      },
      {
        path: paths.public.unknown.href,
        element: <Unknown />,
      },
      {
        path: paths.public.unauthorized.href,
        element: <Unauthorized />,
      },
      {
        path: paths.auth.login.href,
        element: <Login />,
      },
      ...adminRoutes,
      ...staffRoutes,
      {
        path: paths.public["404"].href,
        element: <Page404 />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default function Router() {
  return <RouterProvider router={router} />;
}
