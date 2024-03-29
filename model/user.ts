import type { CircleKey, CircleRole } from "@prisma/client";

export interface User {
  id: string;
  name: string;
}

export type UserWithSession = User & {
  isMember: boolean;
  isAdmin: boolean;
  role: CircleRole | null;
  circleKey: CircleKey | null;
};

export type SessionUser = UserWithSession & {
  profileImageUrl: string | null;
  accessToken: string;
};
