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
    async resolve(parent, { year, month, memberId, circleId }, ctx) {
      if (ctx.user?.id != memberId && !ctx?.user?.isAdmin) {
        throw new Error("Cannot update this user's month circle.");
      }
      const member = await prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new Error('member not found');
      }

      const { circleId: currentCircleId } = member;
      if (!currentCircleId) {
        throw new Error('This member was leaved');
      }

      const monthCircle = await ctx.prisma.monthCircle.upsert({
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
          circleId,
          currentCircleId,
        },
        update: {
          year,
          month,
          memberId,
          circleId,
          currentCircleId,
        },
      });

      return {
        monthCircle,
      };
    },
  }
);

export const UpdateMonthCircleMutation = mutationField('updateMonthCircle', {
  type: UpdateMemberMonthCirclePayload,
  args: { data: nonNull(UpdateMonthCircleMutationInput.asArg()) },
  async resolve(parent, { data: { id, kicked, invited, joined } }, { prisma }) {
    if (kicked != null) {
      await prisma.monthCircle.update({
        where: { id },
        data: { kicked },
      });
    }

    if (invited != null) {
      await prisma.monthCircle.update({
        where: { id },
        data: { invited },
      });
    }

    if (joined != null) {
      await prisma.monthCircle.update({
        where: { id },
        data: { joined },
      });
    }

    const monthCircle = await prisma.monthCircle.findUnique({ where: { id } });

    if (!monthCircle) {
      throw new Error('not found');
    }

    const circleId = monthCircle.circleId;
    if (joined && circleId) {
      try {
        if (process.env.NODE_ENV != 'production') {
          throw new Error('Update role ignored in develop');
        }
        const rest = createDiscordRestClient();
        const roleIds = Guild.roleIds.circleIds;
        roleIds
          .filter((id) => id != monthCircle.circleId)
          .forEach(async (id) => {
            await rest.delete(
              Routes.guildMemberRole(Guild.id, monthCircle.memberId, id)
            );
          });
        await rest.put(
          Routes.guildMemberRole(Guild.id, monthCircle.memberId, circleId)
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
