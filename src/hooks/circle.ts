import { APICircles } from "./../pages/api/circles/index";
import { Circle } from "../model/circle";
import useSWR from "swr";
export function useCircles() {
  const { data, error, mutate } = useSWR<Array<Circle>>(
    "/api/circles",
    async (key) => {
      const res = await fetch(key);
      const json = (await res.json()) as APICircles;
      return json.circles;
    }
  );

  return { circles: data, error, mutate };
}
