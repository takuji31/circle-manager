import { MonthCircle } from ".prisma/client";
import useSWR from "swr";
import { APIMonthCircle } from "../pages/api/members/[memberId]/month_circles/[year]/[month]";
import useUser from "./user";

export function useMonthCircle(memberId: string, year: string, month: string) {
  const { user } = useUser();
  const { data, error, mutate } = useSWR(
    () => {
      return user && ((user.id == memberId && user.isMember) || user.isAdmin)
        ? `/api/members/${memberId}/month_circles/${year}/${month}`
        : null;
    },
    async (url) => {
      const res = await fetch(url);
      return (await res.json()) as APIMonthCircle;
    }
  );

  const onUpdate = async (circleId: string) => {
    const res = await fetch(
      `/api/members/${memberId}/month_circles/${year}/${month}`,
      {
        method: "POST",
        body: JSON.stringify({ circleId }),
      }
    );
    mutate((await res.json()) as APIMonthCircle, false);
  };

  return { monthCircle: data, error, onUpdate };
}
