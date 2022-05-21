import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import React from "react";
import simpleBarStylesheetUrl from "simplebar-react/dist/simplebar.min.css";
import { requireAdminUser } from "~/auth/loader.server";
import { DashboardLayout } from "~/mui/components/admin/dashboard-layout";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: simpleBarStylesheetUrl }];
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdminUser(request);
  return null;
};

export default function AdminIndex() {
  return (
    <>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </>
  );
}
