import { z } from "zod";

export const YearAndMonth = z.object({
  year: z.preprocess((year) => parseInt(year as string), z.number().min(2021)),
  month: z.preprocess(
    (month) => parseInt(month as string),
    z.number().min(1).max(12)
  ),
});

export const YMD = z.intersection(
  YearAndMonth,
  z.object({
    day: z.preprocess(
      (day) => parseInt(day as string),
      z.number().min(1).max(31)
    ),
  })
);
