import type { LoaderFunction } from "remix";
import { redirect } from "remix";
import { authenticator } from "~/auth.server";

export const adminOnly: (fun?: LoaderFunction) => LoaderFunction = (
  fun = () => null
) => {
  const wrapped: LoaderFunction = async (args) => {
    const user = await authenticator.isAuthenticated(args.request, {
      failureRedirect: "/",
    });
    if (!user.isAdmin) {
      redirect("/");
    }
    return fun(args);
  };
  return wrapped;
};
