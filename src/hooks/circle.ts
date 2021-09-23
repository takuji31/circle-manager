import useSWR from "swr";

async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init);
  return res.json();
}

export interface Circle {
  id: string;
  name: string;
}

export default function useCircle(guildId: string, circleId: string) {
  const { data: circle, mutate } = useSWR<Circle>(() => {
    return `/api/guilds/${guildId}/circle/${circleId}`;
  });
  const onCreate = async () => {
    const response = await fetch(`/api/guilds/${guildId}/circles/${circleId}`, {
      method: "POST",
    });
    const newCicle = (await response.json()) as Circle;
    await mutate(newCicle);
  };
  return { onCreate, circle };
}
