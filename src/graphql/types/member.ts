import { PrismaPromise } from '.prisma/client';
import { prisma } from './../../database/prisma';
import { nextMonth, thisMonth, Guild } from '../../model';
import * as Nexus from 'nexus-prisma';
import {
  arg,
  enumType,
  inputObjectType,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from 'nexus';
import { MonthCircle, SignUp } from '.';
import { createDiscordRestClient } from '../../discord';
import { RESTGetAPIGuildMembersResult, Routes } from 'discord-api-types/v9';
import { CircleRole as PrismaCircleRole } from '@prisma/client';
import { resolve } from 'path/posix';
export const Member = objectType({
  name: Nexus.Member.$name,
  description: Nexus.Member.$description,
  definition: (t) => {
    const m = Nexus.Member;
    t.field(m.id);
    t.field(m.pathname);
    t.field(m.circleRole);
    t.field(m.name);
    t.field(m.trainerId);
    t.field(m.setupCompleted);
    t.field(m.joinedAt);
    t.field(m.leavedAt);
    t.field(m.circle);
    t.field('thisMonthCircle', {
      type: MonthCircle,
      async resolve(parent, _, ctx) {
        return await ctx.prisma.monthCircle.findUnique({
          where: {
            year_month_memberId: {
              ...thisMonth(),
              memberId: parent.id,
            },
          },
        });
      },
    });
    t.field('nextMonthCircle', {
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
    t.field('signUp', {
      type: SignUp,
      resolve(parent, _, ctx) {
        return ctx.prisma.signUp.findUnique({
          where: {
            id: parent.id,
          },
        });
      },
    });
  },
});

export const CircleRole = enumType(Nexus.CircleRole);

export const MemberField = queryField('member', {
  type: Member,
  args: {
    id: stringArg(),
    pathname: stringArg(),
  },
  resolve(_, args, ctx) {
    if (args.id) {
      return ctx.prisma.member.findUnique({
        where: {
          id: args.id,
        },
      });
    } else if (args.pathname) {
      return ctx.prisma.member.findUnique({
        where: {
          pathname: args.pathname,
        },
      });
    } else {
      throw new Error('id or pathname required');
    }
  },
});

export const MembersField = queryField('members', {
  type: nonNull(list(nonNull(Member))),
  resolve(_, __, ctx) {
    return ctx.prisma.member.findMany({
      orderBy: [
        {
          circle: {
            order: 'asc',
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
    ctx.prisma.$transaction([
      prisma.member.updateMany({
        where: {
          circleId: {
            not: null,
          },
        },
        data: { circleId: null },
      }),
      ...members
        .filter((member) => !member.user?.bot && member.user)
        .map((member) => {
          const user = member.user!;
          const circleIdOrNull = member.roles.filter(
            (role) => circleIds.indexOf(role) != -1
          )[0];
          const circleRole = member.roles.includes(Guild.roleIds.leader)
            ? PrismaCircleRole.Leader
            : member.roles.includes(Guild.roleIds.subLeader)
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
        }),
    ]);

    return ctx.prisma.member.findMany({
      orderBy: [
        {
          circle: {
            order: 'asc',
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

export const UpdateMemberMutationInput = inputObjectType({
  name: 'UpdateMemberMutationInput',
  definition(t) {
    t.nonNull.string('id');
    t.string('trainerId', { default: null });
    t.string('name', { default: null });
  },
});
export const UpdateMember = mutationField('updateMember', {
  type: nonNull(Member),
  args: {
    input: nonNull(UpdateMemberMutationInput),
  },
  async resolve(_, { input: { id, name, trainerId } }, { prisma, user }) {
    if (!user?.isAdmin && id != user?.id) {
      throw new Error('Cannot modify other member.');
    }
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new Error(`Member id ${id} not found.`);
    }

    const transactions: Array<PrismaPromise<any>> = [];

    return await prisma.member.update({
      where: { id },
      data: {
        id,
        name: name ?? undefined,
        trainerId: trainerId ?? undefined,
      },
    });
  },
});
