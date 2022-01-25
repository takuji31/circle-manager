import { Guild } from './../../model/guild';
import { Routes } from 'discord-api-types/v9';
import { prisma } from './../../database/prisma';
import { MonthCircle as _MonthCircle } from 'nexus-prisma';
import { mutationField, nonNull, stringArg } from 'nexus';
import { createDiscordRestClient } from '../../discord';
import {
  UpdateMemberMonthCirclePayload,
  UpdateMonthCircleMutationInput,
} from '../types';
import { Circles, isCircleKey } from '../../model';

export const UpdateMemberMonthCircleMutation = mutationField(
  'updateMemberMonthCircle',
  {
    type: UpdateMemberMonthCirclePayload,
    args: {
      memberId: nonNull(stringArg()),
      year: nonNull(stringArg()),
      month: nonNull(stringArg()),
      circleId: nonNull(stringArg()),
    },
    async resolve(_, { year, month, memberId, circleId }, { user, prisma }) {
      if (user?.id != memberId && !user?.isAdmin) {
        throw new Error("Cannot update this user's month circle.");
      }
      const member = await prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new Error('member not found');
      }

      const { circleKey: currentCircleKey } = member;
      let monthCircle = await prisma.monthCircle.findUnique({
        where: { year_month_memberId: { memberId, year, month } },
      });

      const circle = Circles.findByRawId(circleId);

      if (!circle) {
        throw new Error(`Unknown circle id ${circleId}`);
      }

      // TODO: MonthCircleStateで更新できるようにする
      if (currentCircleKey) {
        monthCircle = await prisma.monthCircle.upsert({
          where: {
            year_month_memberId: {
              year,
              month,
              memberId,
            },
          },
          create: {
            year,
            month,
            memberId,
            state: currentCircleKey,
          },
          update: {
            year,
            month,
            memberId,
            state: currentCircleKey,
          },
        });
      } else if (user.isAdmin) {
        monthCircle = await prisma.monthCircle.update({
          where: {
            year_month_memberId: {
              year,
              month,
              memberId,
            },
          },
          data: {
            year,
            month,
            memberId,
            state: circle.key,
          },
        });
      } else {
        throw new Error('This member was leaved');
      }

      return {
        monthCircle,
      };
    },
  }
);

export const UpdateMonthCircleMutation = mutationField('updateMonthCircle', {
  type: UpdateMemberMonthCirclePayload,
  args: { data: nonNull(UpdateMonthCircleMutationInput.asArg()) },
  async resolve(
    _,
    { data: { id, kicked, invited, joined } },
    { prisma, user }
  ) {
    if (!user?.isAdmin) {
      throw new Error('Forbidden');
    }

    const monthCircle = await prisma.monthCircle.findUnique({ where: { id } });

    if (!monthCircle) {
      throw new Error('not found');
    }
    await prisma.monthCircle.update({
      where: { id },
      data: {
        kicked: kicked ?? undefined,
        invited: invited ?? undefined,
        joined: joined ?? undefined,
      },
    });

    const state = monthCircle.state;
    if (joined && isCircleKey(state)) {
      const circle = Circles.findByCircleKey(state);
      try {
        if (process.env.NODE_ENV != 'production') {
          throw new Error('Update role ignored in develop');
        }
        const rest = createDiscordRestClient();
        const roleIds = Guild.roleIds.circleIds;
        const removingIds = roleIds.filter((id) => id != circle.id);

        for (const id of removingIds) {
          await rest.delete(
            Routes.guildMemberRole(Guild.id, monthCircle.memberId, id)
          );
        }

        await rest.put(
          Routes.guildMemberRole(Guild.id, monthCircle.memberId, state)
        );
      } catch (e) {
        console.log(e);
      }
    }

    return {
      monthCircle,
    };
  },
});
