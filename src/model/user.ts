export interface User {
  name: string;
}

export type UserWithSession = User & {
  isMember: boolean;
  isAdmin: boolean;
};
