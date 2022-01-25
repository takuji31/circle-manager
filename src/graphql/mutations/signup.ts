import { Circles } from './../../model/circle';
import { Routes } from 'discord-api-types/v9';
import { nonNull, mutationField } from 'nexus';
import { createDiscordRestClient } from '../../discord';
import { Guild } from '../../model';
import { SignUp, UpdateSignUpMutationInput } from '../types';
import { sendInvitedMessage } from '../../discord/member/messages';

export const UpdateSignUpMutation = mutationField('updateSignUp', {
  type: nonNull(SignUp),
  args: {
    input: nonNull(UpdateSignUpMutationInput.asArg()),
  },
  async resolve(_, { input: { memberId, circleKey, invited, joined } }, ctx) {
    let signUp = await ctx.prisma.signUp.findUnique({
      include: {
        member: true,
      },
      where: { id: memberId },
    });

    const signUpInvited = signUp?.invited;
    const circle = circleKey
      ? Circles.findByCircleKey(circleKey)
      : signUp?.circleKey
      ? Circles.findByCircleKey(signUp.circleKey)
      : null;

    if ((joined || invited) && !circle) {
      throw new Error('Cannot join null circle');
    } else if (!signUp) {
      throw new Error(`Unknown member id ${memberId}`);
    } else {
      signUp = await ctx.prisma.signUp.update({
        where: { id: memberId },
        include: {
          member: true,
        },
        data: {
          id: memberId,
          circleKey: circle?.key,
          invited: invited ?? undefined,
          joined: joined ?? undefined,
        },
      });
    }

    if (circle && invited && !signUpInvited) {
      await sendInvitedMessage(signUp.member, circle, 'signUp');
    }

    if (circle && joined) {
      try {
        if (process.env.NODE_ENV != 'production') {
          throw new Error('Update role ignored in develop');
        }
        const rest = createDiscordRestClient();
        const roleIds = Guild.roleIds.circleIds;
        const removingIds = roleIds.filter((id) => id != circle.id);

        for (const id of removingIds) {
          await rest.delete(Routes.guildMemberRole(Guild.id, memberId, id));
        }

        await rest.put(Routes.guildMemberRole(Guild.id, memberId, circle.id));
      } catch (e) {
        console.log(e);
      }

      await ctx.prisma.member.update({
        where: { id: memberId },
        data: { circleKey: circle.key },
      });
    }

    return signUp;
  },
});
