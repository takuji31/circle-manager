export interface User {
  id: string;
  name: string;
}

export type UserWithSession = User & {
  isMember: boolean;
  isAdmin: boolean;
};
