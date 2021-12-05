import { Circles } from './../../model/circle';
import { Routes } from 'discord-api-types/v9';
import { nonNull, mutationField } from 'nexus';
import { createDiscordRestClient } from '../../discord';
import { Guild } from '../../model';
import { SignUp, UpdateSignUpMutationInput } from '../types';

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
