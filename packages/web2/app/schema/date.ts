import { z } from "zod";

export const YearAndMonth = z.object({
  year: z.preprocess((year) => parseInt(year as string), z.number()),
  month: z.preprocess((month) => parseInt(month as string), z.number()),
});
