import { arg, nonNull, queryType, stringArg } from "nexus";
import { Member } from "./member";
export const Query = queryType({
  definition(t) {
    t.field("member", {
      type: Member,
      args: {
        id: nonNull(stringArg()),
      },
      resolve(_, args, ctx) {
        return ctx.prisma.member.findUnique({
          where: {
            id: args.id,
          },
        });
      },
    });
    t.list.field("members", {
      type: Member,
      resolve(parens, args, ctx) {
        return ctx.prisma.member.findMany({
          orderBy: [
            {
              circle: {
                createdAt: "asc",
              },
            },
            {
              circleRole: "asc",
            },
            {
              joinedAt: "asc",
            },
          ],
        });
      },
    });
  },
});
