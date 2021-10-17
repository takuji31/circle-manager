import { nextMonth, thisMonth, Guild } from '../../model';
import { Context } from './../context';
import * as Nexus from 'nexus-prisma';
import {
  enumType,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from 'nexus';
import { MonthCircle } from '.';
import { createDiscordRestClient } from '../../discord';
import { RESTGetAPIGuildMembersResult, Routes } from 'discord-api-types/v9';
import { CircleRole as PrismaCircleRole } from '@prisma/client';
export const Member = objectType({
  name: Nexus.Member.$name,
  description: Nexus.Member.$description,
  definition: (t) => {
    const m = Nexus.Member;
    t.field(m.id);
    t.field(m.pathname);
    t.field(m.circleRole);
    t.field(m.name);
    t.field(m.trainerName);
    t.field(m.trainerId);
    t.field(m.joinedAt);
    t.field(m.leavedAt);
    t.field(m.circle);
    t.field('thisMonthCircle', {
      type: MonthCircle,
      async resolve(parent, _, context: Context) {
        return context.prisma.monthCircle.upsert({
          where: {
            year_month_memberId: {
              ...thisMonth(),
              memberId: parent.id,
            },
          },
          create: {
            ...thisMonth(),
            memberId: parent.id,
          },
          update: {},
        });
      },
    });
    t.field('nextMonthCircle', {
      type: MonthCircle,
      async resolve(parent, _, ctx) {
        return ctx.prisma.monthCircle.upsert({
          where: {
            year_month_memberId: {
              ...nextMonth(),
              memberId: parent.id,
            },
          },
          create: {
            ...nextMonth(),
            memberId: parent.id,
          },
          update: {},
        });
      },
    });
  },
});

export const CircleRole = enumType(Nexus.CircleRole);

export const MemberField = queryField('member', {
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

export const MembersField = queryField('members', {
  type: nonNull(list(nonNull(Member))),
  resolve(_, __, ctx) {
    return ctx.prisma.member.findMany({
      orderBy: [
        {
          circle: {
            createdAt: 'asc',
          },
        },
        {
          circleRole: 'asc',
        },
        {
          joinedAt: 'asc',
        },
      ],
    });
  },
});

export const UpdateMembers = mutationField('updateMembers', {
  type: nonNull(list(nonNull(Member))),
  async resolve(_, __, ctx) {
    if (!ctx.user?.isAdmin) {
      throw new Error('updateMembers not supported');
    }
    const rest = createDiscordRestClient();
    const circles = await ctx.prisma.circle.findMany({
      select: {
        id: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    const circleIds = circles.map((circle: { id: string }) => circle.id);

    const members = (await rest.get(
      `${Routes.guildMembers(Guild.id)}?limit=1000`
    )) as RESTGetAPIGuildMembersResult;
    ctx.prisma.$transaction(
      members
        .filter((member) => !member.user?.bot && member.user)
        .map((member) => {
          const user = member.user!;
          const circleIdOrNull = member.roles.filter(
            (role) => circleIds.indexOf(role) != -1
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
            createdAt: 'asc',
          },
        },
        {
          circleRole: 'asc',
        },
        {
          joinedAt: 'asc',
        },
      ],
    });
  },
});
