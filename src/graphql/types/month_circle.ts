import { prisma } from './../../database/prisma';
import {
  MonthCircle as _MonthCircle,
  MonthCircleAnswerState as _MonthCircleAnswerState,
} from 'nexus-prisma';
import { MonthCircleAnswerState as PrismaMonthCircleAnswerState } from '@prisma/client';
import {
  enumType,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from 'nexus';

export const MonthCircle = objectType({
  name: _MonthCircle.$name,
  description: _MonthCircle.$description,
  definition(t) {
    t.field(_MonthCircle.id);
    t.field(_MonthCircle.year);
    t.field(_MonthCircle.month);
    t.field(_MonthCircle.state);
    t.field(_MonthCircle.circle);
    t.field(_MonthCircle.member);
  },
});

export const MonthCircleAnswerState = enumType(_MonthCircleAnswerState);

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
    async resolve(
      parent,
      { year, month, memberId, circleId: circleIdOrRetired },
      ctx
    ) {
      if (ctx.user?.id != memberId || !ctx.user.isAdmin) {
        throw new Error("Cannot update this user's month circle.");
      }
      const state =
        circleIdOrRetired == 'retired'
          ? PrismaMonthCircleAnswerState.Retired
          : PrismaMonthCircleAnswerState.Answered;
      const circleId =
        circleIdOrRetired != 'retired' ? circleIdOrRetired : null;
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
          state,
          currentCircleId,
        },
        update: {
          year,
          month,
          memberId,
          circleId,
          state,
          currentCircleId,
        },
      });

      return {
        monthCircle,
      };
    },
  }
);
