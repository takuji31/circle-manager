import type { ActionFunction, LoaderFunction } from "remix";
import { redirect } from "remix";
import { authenticator } from "~/auth.server";
import type { AppData } from "@remix-run/server-runtime/data";
import type { DataFunctionArgs } from "@remix-run/server-runtime/routeModules";
import type { SessionUser } from "@/model";

export const adminOnly: (fun?: LoaderFunctionWithUser) => LoaderFunction = (
  fun = () => null
) => {
  const wrapped: LoaderFunction = async (args) => {
    const user = await authenticator.isAuthenticated(args.request, {
      failureRedirect: "/",
    });
    if (!user.isAdmin) {
      redirect("/");
    }
    return fun({ ...args, user });
  };
  return wrapped;
};

export type DataFunctionArgsWithUser = DataFunctionArgs & { user: SessionUser };
export interface LoaderFunctionWithUser {
  (args: DataFunctionArgsWithUser):
    | Promise<Response>
    | Response
    | Promise<AppData>
    | AppData;
}

export interface ActionFunctionWithUser {
  (args: DataFunctionArgsWithUser):
    | Promise<Response>
    | Response
    | Promise<AppData>
    | AppData;
}

export const adminOnlyAction: (
  fun?: ActionFunctionWithUser
) => ActionFunction = (fun = () => null) => {
  const wrapped: ActionFunction = async (args) => {
    const user = await authenticator.isAuthenticated(args.request, {
      failureRedirect: "/",
    });
    if (!user.isAdmin) {
      redirect("/");
    }
    return fun({ ...args, user });
  };
  return wrapped;
};
