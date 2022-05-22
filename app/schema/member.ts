import { CircleKey as _CircleKey } from "@prisma/client";
import { z } from "zod";

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
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type ActiveCircleKey = z.infer<typeof ActiveCircleKey>;

export const TrainerName = z.preprocess(
  (name) => (name as string).trim(),
  z
    .string({ required_error: "トレーナー名を入力してください" })
    .min(1, "トレーナー名は1文字以上で入力してください")
);
