import { Guild } from './../../model/guild';
import { Routes } from 'discord-api-types/v9';
import { prisma } from './../../database/prisma';
import { MonthCircle as _MonthCircle } from 'nexus-prisma';
import {
  arg,
  booleanArg,
  enumType,
  inputObjectType,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from 'nexus';
import { createDiscordRestClient } from '../../discord';

export const MonthCircle = objectType({
  name: _MonthCircle.$name,
  description: _MonthCircle.$description,
  definition(t) {
    t.field(_MonthCircle.id);
    t.field(_MonthCircle.year);
    t.field(_MonthCircle.month);
    t.field(_MonthCircle.circle);
    t.field(_MonthCircle.currentCircle);
    t.field(_MonthCircle.member);
    t.field(_MonthCircle.kicked);
    t.field(_MonthCircle.invited);
    t.field(_MonthCircle.joined);
  },
});

export const UpdateMemberMonthCirclePayload = objectType({
  name: 'UpdateMemberMonthCirclePayload',
  definition(t) {
    t.field('monthCircle', {
      type: nonNull(MonthCircle),
    });
  },
});

export const MonthCircleQuery = queryField('monthCircle', {
  type: MonthCircle,
  args: {
    monthCircleId: nonNull(stringArg()),
  },
  resolve(_, { monthCircleId }, ctx) {
    return ctx.prisma.monthCircle.findUnique({
      where: {
        id: monthCircleId,
      },
    });
  },
});

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

export const UpdateMonthCircleMutationInput = inputObjectType({
  name: 'UpdateMonthCircleMutationInput',
  definition(t) {
    t.nonNull.string('id');
    t.boolean('kicked', { default: null });
    t.boolean('invited', { default: null });
    t.boolean('joined', { default: null });
  },
});

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
