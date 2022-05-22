import { redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export const requireAdminUser = async (request: Request) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  if (!user.isAdmin) {
    throw redirect("/");
  }
  return user;
};
