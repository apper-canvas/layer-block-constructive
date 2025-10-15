import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import Layout from "@/components/organisms/Layout";

const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Contacts = lazy(() => import("@/components/pages/Contacts"));
const ContactDetail = lazy(() => import("@/components/pages/ContactDetail"));
const Leads = lazy(() => import("@/components/pages/Leads"));
const LeadDetail = lazy(() => import("@/components/pages/LeadDetail"));
const Deals = lazy(() => import("@/components/pages/Deals"));
const DealDetail = lazy(() => import("@/components/pages/DealDetail"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));
const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Dashboard />
      </Suspense>
    )
  },
{
    path: "contacts",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Contacts />
      </Suspense>
    )
  },
  {
    path: "contacts/:id",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <ContactDetail />
      </Suspense>
    )
  },
  {
    path: "leads",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Leads />
      </Suspense>
    )
  },
{
path: "leads/:id",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <LeadDetail />
      </Suspense>
    )
  },
  {
    path: "deals",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <Deals />
      </Suspense>
    )
  },
  {
    path: "deals/:id",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <DealDetail />
      </Suspense>
    )
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<div>Loading.....</div>}>
        <NotFound />
      </Suspense>
    )
  }
];

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: mainRoutes
  }
];

export const router = createBrowserRouter(routes);