import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { getRouteConfig } from "@/router/route.utils";
import Root from "@/layouts/Root";
import Layout from "@/components/organisms/Layout";

const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Contacts = lazy(() => import("@/components/pages/Contacts"));
const ContactDetail = lazy(() => import("@/components/pages/ContactDetail"));
const Leads = lazy(() => import("@/components/pages/Leads"));
const LeadDetail = lazy(() => import("@/components/pages/LeadDetail"));
const Deals = lazy(() => import("@/components/pages/Deals"));
const Tasks = lazy(() => import("@/components/pages/Tasks"));
const DealDetail = lazy(() => import("@/components/pages/DealDetail"));
const Companies = lazy(() => import("@/components/pages/Companies"));
const CompanyDetail = lazy(() => import("@/components/pages/CompanyDetail"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const ErrorPage = lazy(() => import("@/components/pages/ErrorPage"));
const ResetPassword = lazy(() => import("@/components/pages/ResetPassword"));
const PromptPassword = lazy(() => import("@/components/pages/PromptPassword"));

const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<div>Loading.....</div>}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

const authRoutes = [
  createRoute({
    path: "login",
    element: <Login />
  }),
  createRoute({
    path: "signup",
    element: <Signup />
  }),
  createRoute({
    path: "callback",
    element: <Callback />
  }),
  createRoute({
    path: "error",
    element: <ErrorPage />
  }),
  createRoute({
    path: "reset-password/:appId/:fields",
    element: <ResetPassword />
  }),
  createRoute({
    path: "prompt-password/:appId/:emailAddress/:provider",
    element: <PromptPassword />
  })
];

const mainRoutes = [
  createRoute({
    path: "",
    index: true,
    element: <Dashboard />
  }),
  createRoute({
    path: "contacts",
    element: <Contacts />
  }),
  createRoute({
    path: "contacts/:id",
    element: <ContactDetail />
  }),
  createRoute({
    path: "companies",
    element: <Companies />
  }),
  createRoute({
    path: "companies/:id",
    element: <CompanyDetail />
  }),
  createRoute({
    path: "leads",
    element: <Leads />
  }),
  createRoute({
    path: "leads/:id",
    element: <LeadDetail />
  }),
  createRoute({
    path: "deals",
    element: <Deals />
  }),
  createRoute({
    path: "deals/:id",
    element: <DealDetail />
  }),
  createRoute({
    path: "tasks",
    element: <Tasks />
  }),
  createRoute({
    path: "*",
    element: <NotFound />
  })
];

const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      ...authRoutes,
      {
        path: "/",
        element: <Layout />,
        children: mainRoutes
      }
    ]
  }
];

export const router = createBrowserRouter(routes);