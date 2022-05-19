import { authenticator } from "~/auth.server";
import { redirect } from "@remix-run/node";

export const requireAdminUser = async (request: Request) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/"
  });
  if (!user.isAdmin) {
    redirect("/");
  }
  return user;
};
