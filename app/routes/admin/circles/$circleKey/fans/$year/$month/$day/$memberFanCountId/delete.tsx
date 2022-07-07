import { LocalDate } from "@js-joda/core";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError } from "remix-validated-form";
import { z } from "zod";
import { prisma } from "~/db.server";
import { notFound } from "~/response.server";
import { YMD } from "~/schema/date";
import { ActiveCircleKey } from "~/schema/member";

const validator = withZod(z.intersection(
  YMD,
  z.object({
    circleKey: ActiveCircleKey,
    memberFanCountId: z.string(),
  }),
));

export const action: ActionFunction = async ({ request, params }) => {
  const result = await validator.validate(params);
  if (result.error) {
    return validationError(result.error);
  }
  const { memberFanCountId, circleKey, year, month, day } = result.data;
  const memberFanCount = await prisma.memberFanCount.findFirst({
    where: {
      id: memberFanCountId,
      circleKey,
      date: LocalDate.of(year, month, day).toUTCDate(),
    },
  });
  if (!memberFanCount) {
    return notFound();
  }
  await prisma.memberFanCount.delete({ where: { id: memberFanCount.id } });
  return redirect(`/admin/circles/${circleKey}/fans/${year}/${month}/${day}/`);
};
