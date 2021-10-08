import { nextMonth } from "./../../date/year_month";
import * as Nexus from "nexus-prisma";
import { enumType, nonNull, objectType, stringArg } from "nexus";
import { MonthCircle } from ".";
import { thisMonth } from "../../date/year_month";
export const Member = objectType({
  name: Nexus.Member.$name,
  description: Nexus.Member.$description,
  definition: (t) => {
    const m = Nexus.Member;
    t.field(m.id);
    t.field(m.circleRole);
    t.field(m.name);
    t.field(m.trainerName);
    t.field(m.trainerId);
    t.field(m.joinedAt);
    t.field(m.leavedAt);
    t.field(m.circle);
    t.field("thisMonthCircle", {
      type: MonthCircle,
      async resolve(parent, _, ctx) {
        return ctx.prisma.monthCircle.findUnique({
          where: {
            year_month_memberId: {
              ...thisMonth(),
              memberId: parent.id,
            },
          },
        });
      },
    });
    t.field("nextMonthCircle", {
      type: MonthCircle,
      async resolve(parent, _, ctx) {
        return ctx.prisma.monthCircle.findUnique({
          where: {
            year_month_memberId: {
              ...nextMonth(),
              memberId: parent.id,
            },
          },
        });
      },
    });
  },
});

export const CircleRole = enumType(Nexus.CircleRole);
