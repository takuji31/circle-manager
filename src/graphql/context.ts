import { ContextFunction } from "apollo-server-core";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import { UserWithSession } from "../model/user";
import prisma from "../prisma";

export type Context = {
  prisma: PrismaClient;
  user: UserWithSession | null;
};
export const createContext: ContextFunction = async ({ req }) => {
  const session = await getSession({ req });
  const user: UserWithSession | null = session
    ? {
        id: session.id as string,
        name: session.name as string,
        isAdmin: session.isAdmin as boolean,
        isMember: session.isMember as boolean,
      }
    : null;
  return {
    prisma,
    user,
  };
};
