import type { LoaderFunction } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { sessionStorage } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const returnTo = session.get("returnTo");
  if (returnTo && !returnTo.match(/^\//)) {
    throw new Response("Invalid return url", { status: 400 });
  }

  return authenticator.authenticate("discord", request, {
    successRedirect: returnTo ?? "/",
    failureRedirect: returnTo ?? "/",
  });
};
