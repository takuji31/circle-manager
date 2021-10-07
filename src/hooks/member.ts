import useSWR from "swr";
import useUser from "./user";

export default function useMember() {
  const { user } = useUser();
  const { data, error } = useSWR(
    () => {
      return user?.isMember ? "/api/members/@me" : null;
    },
    (url: string) => {
      fetch(url);
    }
  );
}
