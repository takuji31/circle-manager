import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { authenticator } from "~/auth.server";
import { sessionStorage } from "~/session.server";

export const loader: LoaderFunction = ({ request }) => redirect("/");

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo");
  if (returnTo && !returnTo.match(/^\//)) {
    throw new Response("Invalid return url", { status: 400 });
  }
  const isAuthenticated = await authenticator.isAuthenticated(request);
  if (isAuthenticated) {
    return redirect(returnTo ?? "/");
  } else {
    try {
      await authenticator.authenticate("discord", request, {
        successRedirect: returnTo ?? "/",
      });
    } catch (e) {
      const response = e as Response;
      const session = await sessionStorage.getSession(
        response.headers.get("Set-Cookie")
      );
      session.set("returnTo", returnTo);
      response.headers.append(
        "Set-Cookie",
        await sessionStorage.commitSession(session)
      );
      return response;
    }
  }
};
