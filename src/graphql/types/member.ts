import {
  Circles,
  nextMonth,
  nextMonthInt,
  thisMonth,
  thisMonthInt,
} from '../../model';
import * as Nexus from 'nexus-prisma';
import { enumType, inputObjectType, objectType } from 'nexus';
import { Circle } from './circle';
import { MonthCircle } from './month_circle';
import { SignUp } from './signup';
import { MonthSurveyAnswer } from './month_survey_answer';

export const Member = objectType({
  name: Nexus.Member.$name,
  description: Nexus.Member.$description,
  definition: (t) => {
    const m = Nexus.Member;
    t.field(m.id);
    t.field(m.pathname);
    t.field(m.circleRole);
    t.field(m.name);
    t.field(m.trainerId);
    t.field(m.setupCompleted);
    t.field(m.joinedAt);
    t.field(m.leavedAt);
    t.field(m.circleKey);
    t.field(m.messageChannelId);
    t.field('circle', {
      type: Circle,
      resolve({ circleKey }, _, __) {
        if (!circleKey) {
          return null;
        } else {
          return Circles.findByCircleKey(circleKey);
        }
      },
    });
    t.field('thisMonthCircle', {
      type: MonthCircle,
      resolve({ id }, _, ctx) {
        return ctx.prisma.member
          .findUnique({ where: { id } })
          .monthCircles({
            where: {
              ...thisMonthInt(),
            },
          })
          .then((monthCircles) => monthCircles[0]);
      },
    });
    t.field('nextMonthCircle', {
      type: MonthCircle,
      resolve({ id }, _, ctx) {
        return ctx.prisma.member
          .findUnique({ where: { id } })
          .monthCircles({
            where: {
              ...nextMonthInt(),
            },
          })
          .then((monthCircles) => monthCircles[0]);
      },
    });
    t.field('signUp', {
      type: SignUp,
      resolve({ id }, _, ctx) {
        return ctx.prisma.member.findUnique({ where: { id } }).signUp();
      },
    });
    t.field('nextMonthSurveyAnswer', {
      type: MonthSurveyAnswer,
      description: '次の月の在籍希望アンケート回答',
      resolve({ id }, _, { prisma }) {
        return prisma.member
          .findUnique({ where: { id } })
          .monthSurveyAnswer({
            where: {
              ...nextMonth(),
            },
          })
          .then((values) => values[0]);
      },
    });
  },
});

export const CircleRole = enumType(Nexus.CircleRole);

export const UpdateMemberMutationInput = inputObjectType({
  name: 'UpdateMemberMutationInput',
  definition(t) {
    t.nonNull.string('id');
    t.string('trainerId', { default: null });
    t.string('name', { default: null });
    t.boolean('setupCompleted', { default: null });
  },
});
