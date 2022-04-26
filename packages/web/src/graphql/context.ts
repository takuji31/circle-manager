import { ContextFunction } from 'apollo-server-core';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';
import { UserWithSession } from '../model';
import { prisma } from '../database';

export type Context = {
  prisma: PrismaClient;
  user: UserWithSession | null;
};

export const createContext: ContextFunction = async ({ req }) => {
  const session = await getSession({ req });
  const user: UserWithSession | null = session
    ? (session as unknown as UserWithSession)
    : null;
  return {
    prisma,
    user,
  };
};
