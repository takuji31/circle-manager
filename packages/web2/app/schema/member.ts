import { z } from "zod";
import { CircleKey as _CircleKey } from "@prisma/client";

export const PathnameParams = z.object({
  pathname: z.string(),
});

export const TrainerId = z
  .string()
  .regex(/^([0-9]{9}|[0-9]{12})$/, "9桁または12桁の数字で入力してください");

export const MemberName = z.preprocess(
  (name) => (name as string).trim(),
  z.string().min(1)
);
export const MemberId = z.string().regex(/^0-9+$/);

export const ActiveCircleKey = z.enum([
  _CircleKey.Saikyo,
  _CircleKey.Shin,
  _CircleKey.Ha,
]);
export type ActiveCircleKey = z.infer<typeof ActiveCircleKey>;

export const TrainerName = z.preprocess(
  (name) => (name as string).trim(),
  z.string()
);
