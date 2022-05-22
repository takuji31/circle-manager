import type { ActionFunction } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo");
  if (returnTo && !returnTo.match(/^\//)) {
    throw new Response("Invalid return url", { status: 400 });
  }
  await authenticator.logout(request, { redirectTo: returnTo ?? "/" });
};
