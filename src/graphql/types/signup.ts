import { Routes } from 'discord-api-types';
import {
  objectType,
  queryField,
  list,
  nonNull,
  mutationField,
  stringArg,
  booleanArg,
} from 'nexus';
import { SignUp as T } from 'nexus-prisma';
import { resolve } from 'path/posix';
import { createDiscordRestClient } from '../../discord';
import { Guild } from '../../model';
export const SignUp = objectType({
  name: T.$name,
  description: T.$description,
  definition(t) {
    t.field(T.id);
    t.field(T.circle);
    t.field(T.member);
    t.field(T.invited);
    t.field(T.joined);
  },
});

export const SignUps = queryField('signUps', {
  type: nonNull(list(nonNull(SignUp))),
  async resolve(_, __, ctx) {
    return ctx.prisma.signUp.findMany({
      where: { joined: false },
      orderBy: { createdAt: 'asc' },
    });
  },
});

export const UpdateSignUpMutation = mutationField('updateSignUp', {
  type: nonNull(SignUp),
  args: {
    memberId: nonNull(stringArg()),
    invited: booleanArg(),
    joined: booleanArg(),
  },
  async resolve(_, { memberId, invited, joined }, ctx) {
    const signUp = await ctx.prisma.signUp.findUnique({
      where: { id: memberId },
    });
    if (!signUp) {
      throw new Error('Not found');
    }

    const data: { invited?: boolean; joined?: boolean } = {};

    if (invited != null) {
      data.invited = invited;
    }
    if (joined != null) {
      data.joined = joined;
    }

    const circleId = signUp.circleId;
    if (joined) {
      try {
        const rest = createDiscordRestClient();
        const roleIds = Guild.roleIds.circleIds;
        roleIds
          .filter((id) => id != circleId)
          .forEach(async (id) => {
            await rest.delete(Routes.guildMemberRole(Guild.id, memberId, id));
          });
        await rest.put(Routes.guildMemberRole(Guild.id, memberId, circleId));
      } catch (e) {
        console.log(e);
      }
    }

    return await ctx.prisma.signUp.update({
      where: { id: memberId },
      data: data,
    });
  },
});
