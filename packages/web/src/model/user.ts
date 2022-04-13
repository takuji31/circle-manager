import { CircleKey, CircleRole } from '../graphql/generated/type';

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
