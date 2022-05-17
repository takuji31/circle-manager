import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";

import { authenticator } from "~/auth.server";

export const loader: LoaderFunction = ({ request }) => redirect("/");

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate("discord", request);
};
