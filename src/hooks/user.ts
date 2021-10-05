import { UserWithSession } from "./../model/user";
import { useSession } from "next-auth/react";
export default function useUser() {
  const { data, status } = useSession();
  if (data == null) {
    return { status };
  }
  const user = {
    id: data.id as string,
    name: data.name as string,
    isAdmin: data.isAdmin as boolean,
    isMember: data.isMember as boolean,
  };
  return { user, status };
}
