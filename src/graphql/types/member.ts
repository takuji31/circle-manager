import * as Nexus from "nexus-prisma";
import { enumType, nonNull, objectType, stringArg } from "nexus";
import { MonthCircle } from ".";
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
    t.field("monthCircle", {
      type: MonthCircle,
      args: {
        year: nonNull(stringArg()),
        month: nonNull(stringArg()),
      },
      async resolve(parent, args, ctx) {
        return ctx.prisma.monthCircle.findUnique({
          where: {
            year_month_memberId: {
              year: args.year,
              month: args.month,
              memberId: parent.id,
            },
          },
        });
      },
    });
  },
});

export const CircleRole = enumType(Nexus.CircleRole);
