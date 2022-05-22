import { z } from "zod";
import { ActiveCircleKey } from "~/schema/member";

export const SignUpUrlParams = z.object({
  circleKey: ActiveCircleKey,
  memo: z.string(),
});

export const SignUpUrlIdParams = z.object({ signUpUrlId: z.string() });
