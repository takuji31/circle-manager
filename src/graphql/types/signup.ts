import { Circles } from './../../model/circle';
import { Routes } from 'discord-api-types/v9';
import {
  objectType,
  queryField,
  list,
  nonNull,
  mutationField,
  stringArg,
  booleanArg,
  inputObjectType,
} from 'nexus';
import { SignUp as T } from 'nexus-prisma';
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

export const UpdateSignUpMutationInput = inputObjectType({
  name: 'UpdateSignUpMutationInput',
  definition(t) {
    t.nonNull.string('memberId');
    t.string('circleId', { default: null });
    t.boolean('invited', { default: null });
    t.boolean('joined', { default: null });
  },
});

export const UpdateSignUpMutation = mutationField('updateSignUp', {
  type: nonNull(SignUp),
  args: {
    input: nonNull(UpdateSignUpMutationInput.asArg()),
  },
  async resolve(
    _,
    { input: { memberId, circleId: circleIdOrNull, invited, joined } },
    ctx
  ) {
    const signUp = await ctx.prisma.signUp.findUnique({
      where: { id: memberId },
    });

    if (!signUp && !circleIdOrNull) {
      throw new Error('Not found');
    }

    const circleId = circleIdOrNull ?? signUp?.circleId;

    if (joined && circleId) {
      try {
        if (process.env.NODE_ENV != 'production') {
          throw new Error('Update role ignored in develop');
        }
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
      await ctx.prisma.member.update({
        where: { id: memberId },
        data: { circleId },
      });
    }

    const data = {
      invited: invited ?? undefined,
      joined: joined ?? undefined,
    };

    return await ctx.prisma.signUp.upsert({
      where: { id: memberId },
      create: {
        id: memberId,
        circleId: circleId ?? Circles.specialIds.noAnswer,
        ...data,
      },
      update: data,
    });
  },
});
