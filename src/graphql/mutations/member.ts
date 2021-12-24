import { prisma } from './../../database/prisma';
import { Guild } from '../../model';
import { list, mutationField, nonNull } from 'nexus';
import { createDiscordRestClient } from '../../discord';
import {
  RESTGetAPIGuildMembersResult,
  Routes,
  RESTPatchAPIGuildMemberJSONBody,
  RESTPatchAPIGuildMemberResult,
} from 'discord-api-types/v9';
import { CircleRole as PrismaCircleRole, PrismaPromise } from '@prisma/client';
import { Member, UpdateMemberMutationInput } from '../types';

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
    await ctx.prisma.$transaction([
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

    await ctx.prisma.member.updateMany({
      where: {
        leavedAt: { not: null },
      },
      data: {
        circleId: null,
      },
    });

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

export const UpdateMember = mutationField('updateMember', {
  type: nonNull(Member),
  args: {
    input: nonNull(UpdateMemberMutationInput),
  },
  async resolve(
    _,
    { input: { id, name, trainerId, setupCompleted } },
    { prisma }
  ) {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      throw new Error(`Member id ${id} not found.`);
    }

    if (name && member.name != name) {
      const rest = createDiscordRestClient();
      const body: RESTPatchAPIGuildMemberJSONBody = {
        nick: name,
      };
      await rest.patch(Routes.guildMember(Guild.id, member.id), {
        body,
      });
    }

    return await prisma.member.update({
      where: { id },
      data: {
        id,
        name: name ?? undefined,
        trainerId: trainerId ?? undefined,
        setupCompleted: setupCompleted ?? undefined,
      },
    });
  },
});
