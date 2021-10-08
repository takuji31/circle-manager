import { nextMonth } from "./../../date/year_month";
import * as Nexus from "nexus-prisma";
import {
  enumType,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
} from "nexus";
import { MonthCircle } from ".";
import { thisMonth } from "../../date/year_month";
import { createDiscordRestClient } from "../../discord";
import { RESTGetAPIGuildMembersResult, Routes } from "discord-api-types/v9";
import { Guild } from "../../model/guild";
import { CircleRole as PrismaCircleRole } from "@prisma/client";
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

export const MembersField = queryField("members", {
  type: nonNull(list(nonNull(Member))),
  resolve(_, __, ctx) {
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

export const UpdateMembers = mutationField("updateMembers", {
  type: nonNull(list(nonNull(Member))),
  async resolve(_, __, ctx) {
    if (!ctx.user?.isAdmin) {
      throw new Error("updateMembers not supported");
    }
    const rest = createDiscordRestClient();
    const cirdleIds = (
      await ctx.prisma.circle.findMany({
        orderBy: {
          id: "asc",
        },
      })
    ).map((circle) => circle.id);

    const members = (await rest.get(
      `${Routes.guildMembers(Guild.id)}?limit=1000`
    )) as RESTGetAPIGuildMembersResult;
    ctx.prisma.$transaction(
      members
        .filter((member) => !member.user?.bot && member.user)
        .map((member) => {
          const user = member.user!;
          const circleIdOrNull = member.roles.filter(
            (role) => cirdleIds.indexOf(role) != -1
          )[0];
          const circleRole = member.roles.includes(Guild.roleId.leader)
            ? PrismaCircleRole.Leader
            : member.roles.includes(Guild.roleId.subLeader)
            ? PrismaCircleRole.SubLeader
            : PrismaCircleRole.Member;
          return ctx.prisma.member.upsert({
            where: {
              id: user.id,
            },
            create: {
              id: user.id,
              name: member.nick ?? user.username,
              circleId: circleIdOrNull,
              circleRole: circleRole,
              joinedAt: member.joined_at,
            },
            update: {
              name: member.nick ?? user.username,
              circleId: circleIdOrNull,
              circleRole: circleRole,
              joinedAt: member.joined_at,
            },
          });
        })
    );

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
