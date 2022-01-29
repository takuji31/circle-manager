import { Guild } from './../../model/guild';
import { Routes } from 'discord-api-types/v9';
import { MonthCircle as _MonthCircle } from 'nexus-prisma';
import { intArg, mutationField, nonNull, stringArg } from 'nexus';
import { createDiscordRestClient } from '../../discord';
import {
  CreateMonthCirclesPayload,
  UpdateMemberMonthCirclePayload,
  UpdateMonthCircleMutationInput,
} from '../types';
import {
  Circles,
  isCircleKey,
  JST,
  nextMonthInt,
  thisMonthInt,
} from '../../model';
import { toDate, toDateTime } from '../../model/date';
import { Temporal } from 'proposal-temporal';
import {
  CircleKey,
  CircleRole,
  MonthCircleState,
  MonthSurveyAnswerValue,
} from '@prisma/client';

export const UpdateMemberMonthCircleMutation = mutationField(
  'updateMemberMonthCircle',
  {
    type: UpdateMemberMonthCirclePayload,
    args: {
      memberId: nonNull(stringArg()),
      year: nonNull(intArg()),
      month: nonNull(intArg()),
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

export const CreateMonthCirclesMutation = mutationField(
  'createNextMonthCircles',
  {
    type: nonNull(CreateMonthCirclesPayload),
    async resolve(_, __, { prisma }) {
      const { year, month } = nextMonthInt();
      const { year: thisMonthYear, month: thisMonth } = thisMonthInt();
      const monthSurvey = await prisma.monthSurvey.findFirst({
        where: {
          year: year.toString(),
          month: month.toString(),
          expiredAt: {
            lte: toDateTime(Temporal.now.zonedDateTimeISO(JST)),
          },
        },
      });
      if (!monthSurvey) {
        throw new Error(`Month survey of ${year}/${month} not completed yet`);
      }

      const noRankingMembers = await prisma.member.findMany({
        include: {
          MonthSurveyAnswer: {
            where: {
              year: year.toString(),
              month: month.toString(),
            },
            take: 1,
          },
        },
        where: {
          monthCircles: {
            none: {
              year: year,
              month: month,
              locked: true,
            },
          },
          MonthSurveyAnswer: {
            some: {
              year: year.toString(),
              month: month.toString(),
              value: {
                in: ['Leave', 'Ob', 'None', 'Saikyo'],
              },
            },
          },
        },
      });

      const leaders = await prisma.member.findMany({
        where: { circleRole: CircleRole.Leader },
      });

      const totalMemberCount = (
        await prisma.monthSurveyAnswer.aggregate({
          _count: {
            id: true,
          },
          where: {
            year: year.toString(),
            month: month.toString(),
            value: MonthSurveyAnswerValue.Umamusume,
          },
        })
      )._count.id;
      const memberMaxCount = Math.floor(totalMemberCount / 30);
      const remainderMembes = totalMemberCount % 30;
      const maxMemberCount: Record<Exclude<CircleKey, 'Saikyo'>, number> = {
        Shin:
          memberMaxCount -
          leaders.filter((m) => m.circleKey == CircleKey.Shin).length,
        Ha:
          memberMaxCount -
          leaders.filter((m) => m.circleKey == CircleKey.Ha).length +
          (remainderMembes == 2 ? 1 : 0),
        Jo:
          memberMaxCount -
          leaders.filter((m) => m.circleKey == CircleKey.Jo).length +
          (remainderMembes > 0 ? 1 : 0),
      };

      console.log('Max member count %s', maxMemberCount);

      const rankingMembers = await prisma.member.findMany({
        include: {
          fanCounts: {
            where: {
              date: {
                gte: toDate(
                  Temporal.PlainDate.from({
                    year: thisMonth,
                    month: thisMonthYear,
                    day: 1,
                  })
                ),
                lt: toDate(
                  Temporal.PlainDate.from({
                    year,
                    month,
                    day: 1,
                  })
                ),
              },
            },
            orderBy: {
              date: 'desc',
            },
            take: 1,
          },
        },
        where: {
          MonthSurveyAnswer: {
            some: {
              year: year.toString(),
              month: month.toString(),
              value: MonthSurveyAnswerValue.Umamusume,
            },
          },
        },
      });

      await prisma.$transaction([
        prisma.monthCircle.deleteMany({
          where: {
            year,
            month,
            locked: false,
          },
        }),
        prisma.monthCircle.createMany({
          data: noRankingMembers.map(
            ({ id: memberId, MonthSurveyAnswer: [{ value }] }) => ({
              memberId,
              year,
              month,
              locked: false,
              state:
                value == 'Saikyo'
                  ? MonthCircleState.Saikyo
                  : value == 'Leave'
                  ? MonthCircleState.Leaved
                  : value == 'None'
                  ? MonthCircleState.Kicked
                  : MonthCircleState.OB,
            })
          ),
          skipDuplicates: true,
        }),
        prisma.monthCircle.createMany({
          data: leaders.map(({ id: memberId, circleKey }) => ({
            memberId,
            year,
            month,
            locked: false,
            state: circleKey!,
          })),
        }),
        prisma.monthCircle.createMany({
          data: rankingMembers.map(({ id: memberId }, idx) => ({
            memberId,
            year,
            month,
            locked: false,
            // TODO: 稼働目標の考慮
            state:
              idx < maxMemberCount.Shin
                ? MonthCircleState.Shin
                : idx < maxMemberCount.Shin + maxMemberCount.Ha
                ? MonthCircleState.Ha
                : MonthCircleState.Jo,
          })),
        }),
      ]);
      return {
        year,
        month,
        monthCircles: await prisma.monthCircle.findMany({
          where: {
            year,
            month,
          },
          // TODO: 最適なソート順
          orderBy: [
            {
              state: 'asc',
            },
            {
              member: {
                joinedAt: 'asc',
              },
            },
          ],
        }),
      };
    },
  }
);
