import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { authenticator } from "./auth.server";
import type { SessionUser } from "@circle-manager/shared/model";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "ウマ娘愛好会",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: SessionUser | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await authenticator.isAuthenticated(request),
  });
};

export default function App() {
  return (
    <html lang="ja" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
