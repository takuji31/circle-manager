import { UserWithSession } from '../model';
import { useSession } from 'next-auth/react';
import { CircleKey, CircleRole } from '../graphql/generated/type';
export default function useUser() {
  const { data, status } = useSession();
  if (data == null) {
    return { status };
  }
  const user: UserWithSession = {
    id: data.id as string,
    name: data.name as string,
    isAdmin: data.isAdmin as boolean,
    isMember: data.isMember as boolean,
    role: data.role as CircleRole | null,
    circleKey: data.circleKey as CircleKey | null,
  };
  return { user, status };
}
