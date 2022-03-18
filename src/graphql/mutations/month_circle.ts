import { Guild } from './../../model/guild';
import { Routes } from 'discord-api-types/v9';
import { MonthCircle as _MonthCircle } from 'nexus-prisma';
import { booleanArg, mutationField, nonNull } from 'nexus';
import { createDiscordRestClient } from '../../discord';
import {
  CreateMonthCirclesPayload,
  UpdateMemberMonthCircleMutationInput,
  UpdateMemberMonthCirclePayload,
  UpdateMonthCircleMutationInput,
} from '../types';
import { Circles, isCircleKey, nextMonthInt } from '../../model';
import {
  CircleKey,
  CircleRole,
  MemberStatus,
  MonthCircleState,
  MonthSurveyAnswerValue,
} from '@prisma/client';
import {
  sendInvitedMessage,
  sendKickedMessage,
} from '../../discord/member/messages';
import {
  ZonedDateTime,
  convert,
  TemporalAdjusters,
  LocalDate,
} from '../../model/date';
import { setMemberCircleRole } from '../../discord/role';

export const UpdateMemberMonthCircleMutation = mutationField(
  'updateMemberMonthCircle',
  {
    type: UpdateMemberMonthCirclePayload,
    args: {
      input: nonNull(UpdateMemberMonthCircleMutationInput.asArg()),
    },
    async resolve(
      _,
      { input: { year, month, memberId, state, locked } },
      { user, prisma }
    ) {
      if (!user?.isAdmin) {
        throw new Error('Cannot update');
      }
      const member = await prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new Error('member not found');
      }

      let monthCircle = await prisma.monthCircle.findUnique({
        where: { year_month_memberId: { memberId, year, month } },
      });

      if (!monthCircle && !state) {
        throw new Error('Cannot create without state');
      }

      if (
        member.status == MemberStatus.Leaved ||
        member.status == MemberStatus.Kicked
      ) {
        throw new Error('This member was leaved');
      }

      if (monthCircle) {
        monthCircle = await prisma.monthCircle.update({
          where: { year_month_memberId: { year, month, memberId } },
          data: {
            state: state ?? undefined,
            locked: locked ?? undefined,
          },
        });
      } else {
        monthCircle = await prisma.monthCircle.create({
          data: {
            memberId,
            year,
            month,
            state: state!,
            locked: locked ?? false,
          },
        });
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

    const beforeMonthCircle = await prisma.monthCircle.findUnique({
      where: { id },
      include: {
        member: true,
      },
    });

    if (!beforeMonthCircle) {
      throw new Error('not found');
    }

    const member = await prisma.member.findUnique({
      where: { id: beforeMonthCircle.member.id },
    });

    if (!member) {
      throw new Error('Unknown member');
    }

    const {
      kicked: beforeKicked,
      invited: beforeInvited,
      currentCircleKey,
    } = beforeMonthCircle;
    const circle = currentCircleKey
      ? Circles.findByCircleKey(currentCircleKey)
      : null;

    const monthCircle = await prisma.monthCircle.update({
      where: { id },
      data: {
        kicked: kicked ?? undefined,
        invited: invited ?? undefined,
        joined: joined ?? undefined,
      },
    });

    const { state } = monthCircle;

    if (!beforeKicked && kicked && circle) {
      await sendKickedMessage(
        member,
        circle,
        state == 'Kicked'
          ? 'kick'
          : state == 'Leaved' || state == 'OB'
          ? 'leave'
          : 'move'
      );

      if (state == 'Kicked' && process.env.NODE_ENV == 'production') {
        const rest = createDiscordRestClient();
        try {
          await rest.put(Routes.guildBan(Guild.id, member.id), {
            headers: {
              'X-Audit-Log-Reason': `サークル除名による自動BAN`,
            },
          });
        } catch (e) {
          console.log(e);
        }
      } else if (
        (state == MonthCircleState.OB || state == MonthCircleState.Leaved) &&
        process.env.NODE_ENV == 'production'
      ) {
        const rest = createDiscordRestClient();
        try {
        } catch (e) {
          console.log(e);
        }
      }
    }

    if (!beforeInvited && invited && circle && isCircleKey(state)) {
      const newCircle = Circles.findByCircleKey(state);
      await sendInvitedMessage(member, newCircle, 'move');
    }

    if (joined && isCircleKey(state)) {
      const circle = Circles.findByCircleKey(state);
      try {
        if (process.env.NODE_ENV != 'production') {
          throw new Error('Update role ignored in develop');
        }
        await setMemberCircleRole(monthCircle.memberId, circle.id);
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
    args: {
      withoutNewMembers: nonNull(booleanArg({ default: false })),
    },
    async resolve(_, { withoutNewMembers }, { prisma }) {
      const { year, month } = nextMonthInt();
      const now = ZonedDateTime.nowJST();

      const monthSurvey = await prisma.monthSurvey.findFirst({
        where: {
          year,
          month,
          expiredAt: {
            lte: now.toDate(),
          },
        },
      });
      if (!monthSurvey) {
        throw new Error(`Month survey of ${year}/${month} not completed yet`);
      }

      const noRankingMembers = await prisma.member.findMany({
        include: {
          monthSurveyAnswer: {
            where: {
              year,
              month,
            },
            take: 1,
          },
        },
        where: {
          monthCircles: {
            none: {
              year,
              month,
              locked: true,
            },
          },
          monthSurveyAnswer: {
            some: {
              year,
              month,
              value: {
                in: ['Leave', 'Ob', 'None', 'Saikyo'],
              },
            },
          },
        },
      });

      const leaders = await prisma.member.findMany({
        where: {
          circleRole: CircleRole.Leader,
          monthSurveyAnswer: {
            some: {
              year,
              month,
              value: {
                notIn: ['Leave', 'Ob', 'None', 'Saikyo'],
              },
            },
          },
        },
      });

      const lockedMembers = await prisma.member.findMany({
        include: {
          monthCircles: {
            where: {
              year,
              month,
            },
            take: 1,
          },
        },
        where: {
          monthCircles: {
            some: {
              year,
              month,
              locked: true,
            },
          },
        },
      });

      const totalMemberCount = (
        await prisma.monthSurveyAnswer.aggregate({
          _count: {
            id: true,
          },
          where: {
            year,
            month,
            value: MonthSurveyAnswerValue.Umamusume,
          },
        })
      )._count.id;
      const newMembers = 60 - totalMemberCount;
      const newMembersPerCircle = withoutNewMembers
        ? 0
        : Math.floor(newMembers / 2);
      const remainderNewMembers = withoutNewMembers ? 0 : newMembers % 2;
      const maxMemberCount: Record<
        Exclude<CircleKey, 'Saikyo' | 'Jo'>,
        number
      > = {
        Shin:
          30 -
          leaders.filter((m) => m.circleKey == CircleKey.Shin).length -
          lockedMembers.filter(
            (m) => m.monthCircles[0].state == MonthCircleState.Shin
          ).length -
          newMembersPerCircle,

        Ha:
          30 -
          leaders.filter((m) => m.circleKey == CircleKey.Ha).length -
          lockedMembers.filter(
            (m) => m.monthCircles[0].state == MonthCircleState.Ha
          ).length -
          newMembersPerCircle -
          (remainderNewMembers > 0 ? 1 : 0),
      };

      console.log('Max member count %s', maxMemberCount);

      const rankingMembers = (
        await prisma.member.findMany({
          include: {
            fanCounts: {
              where: {
                date: {
                  gte: LocalDate.firstDayOfThisMonth().toUTCDate(),
                  lt: LocalDate.firstDayOfNextMonth().toUTCDate(),
                },
              },
              orderBy: {
                date: 'desc',
              },
              take: 1,
            },
          },
          where: {
            circleRole: {
              not: CircleRole.Leader,
            },
            monthSurveyAnswer: {
              some: {
                year,
                month,
                value: MonthSurveyAnswerValue.Umamusume,
              },
            },
            monthCircles: {
              none: {
                year,
                month,
                locked: true,
              },
            },
          },
        })
      ).sort((a, b) =>
        parseInt((b.fanCounts[0].avg - a.fanCounts[0].avg).toString())
      );

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
            ({ id: memberId, circleKey, monthSurveyAnswer: [{ value }] }) => ({
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
              currentCircleKey: circleKey,
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
            currentCircleKey: circleKey,
          })),
          skipDuplicates: true,
        }),
        prisma.monthCircle.createMany({
          data: rankingMembers.map(({ id: memberId, circleKey }, idx) => ({
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
                : MonthCircleState.OB,
            currentCircleKey: circleKey,
          })),
          skipDuplicates: true,
        }),
      ]);
      return {
        year,
        month,
        monthCircles: await prisma.monthCircle.findMany({
          where: {
            year,
            month,
            member: {
              leavedAt: null,
            },
          },
          // TODO: 最適なソート順
          orderBy: [
            {
              currentCircleKey: 'asc',
            },
            {
              member: {
                circleRole: 'asc',
              },
            },
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
