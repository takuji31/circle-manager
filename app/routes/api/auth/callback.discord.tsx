import type { LoaderFunction } from "remix";
import { authenticator } from "~/auth.server";

export const loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate("discord", request, {
    successRedirect: "/",
    failureRedirect: "/",
  });
};
