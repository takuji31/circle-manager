import { prisma } from './../../database/prisma';
import { Circle, Circles, Guild } from '../../model';
import { list, mutationField, nonNull } from 'nexus';
import { createDiscordRestClient } from '../../discord';
import {
  RESTGetAPIGuildMembersResult,
  Routes,
  RESTPatchAPIGuildMemberJSONBody,
} from 'discord-api-types/v9';
import { CircleRole as PrismaCircleRole, MemberStatus } from '@prisma/client';
import { Member, UpdateMemberMutationInput } from '../types';

export const UpdateMembers = mutationField('updateMembers', {
  type: nonNull(list(nonNull(Member))),
  async resolve(_, __, ctx) {
    if (!ctx.user?.isAdmin) {
      throw new Error('updateMembers not supported');
    }
    const rest = createDiscordRestClient();
    const circleIds = Object.values(Circle).map(
      (circle) => circle.id as string
    );

    const members = (
      (await rest.get(
        `${Routes.guildMembers(Guild.id)}?limit=1000`
      )) as RESTGetAPIGuildMembersResult
    ).filter((member) => !member.user?.bot && member.user);
    await ctx.prisma.$transaction([
      prisma.member.updateMany({
        where: {
          id: {
            notIn: [...members.map((member) => member.user?.id!)],
          },
          status: MemberStatus.Joined,
        },
        data: {
          status: MemberStatus.Leaved,
          circleKey: null,
        },
      }),
      prisma.member.updateMany({
        where: {
          id: {
            notIn: [...members.map((member) => member.user?.id!)],
          },
          status: MemberStatus.Leaved,
          leavedAt: null,
        },
        data: {
          leavedAt: new Date(),
        },
      }),
      ...members.map((member) => {
        const user = member.user!;
        const circleIdOrNull = member.roles.filter(
          (role) => circleIds.indexOf(role) != -1
        )[0];
        const isOb = member.roles.includes(Guild.roleIds.ob);
        const isNotJoined = member.roles.includes(Guild.roleIds.notJoined);
        const circle =
          !isOb && !isNotJoined && circleIdOrNull
            ? Circles.findByRawId(circleIdOrNull)
            : null;
        const status = isOb
          ? MemberStatus.OB
          : isNotJoined
          ? MemberStatus.NotJoined
          : circle != null
          ? MemberStatus.Joined
          : MemberStatus.NotJoined;
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
            circleKey: circle?.key ?? null,
            circleRole: circleRole,
            joinedAt: member.joined_at,
            status,
          },
          update: {
            name: member.nick ?? user.username,
            circleKey: circle?.key ?? null,
            circleRole: circleRole,
            joinedAt: member.joined_at,
            status,
          },
        });
      }),
    ]);

    await ctx.prisma.member.updateMany({
      where: {
        leavedAt: { not: null },
      },
      data: {
        circleKey: null,
      },
    });

    return ctx.prisma.member.findMany({
      orderBy: [
        {
          circleKey: 'asc',
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
