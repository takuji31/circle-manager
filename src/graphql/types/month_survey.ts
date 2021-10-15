import { MonthSurvey as _MonthSurvey } from 'nexus-prisma';
import {
  enumType,
  intArg,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from 'nexus';

export const MonthSurvey = objectType({
  name: _MonthSurvey.$name,
  description: _MonthSurvey.$description,
  definition(t) {
    t.field(_MonthSurvey.id);
    t.field(_MonthSurvey.year);
    t.field(_MonthSurvey.month);
    t.field(_MonthSurvey.expiredAt);
  },
});

export const CreateNextMonthSurveyPayload = objectType({
  name: 'CreateNextMonthSurveyPayload',
  definition(t) {
    t.field('monthSurvey', {
      type: nonNull(MonthSurvey),
    });
  },
});

// export const CreateNextMonthSurveyMutation = mutationField(
//   'createNextMonthSurvey',
//   {
//     type: CreateNextMonthSurveyPayload,
//     args: {
//       year: nonNull(stringArg()),
//       month: nonNull(stringArg()),
//       expiredDay: nonNull(intArg()),
//     },
//     async resolve(
//       parent,
//       { year, month, memberId, circleId: circleIdOrRetired },
//       ctx
//     ) {
//       if (ctx.user?.id != memberId || !ctx.user.isAdmin) {
//         throw new Error("Cannot update this user's month circle.");
//       }
//       const state =
//         circleIdOrRetired == 'retired'
//           ? PrismaMonthCircleAnswerState.Retired
//           : PrismaMonthCircleAnswerState.Answered;
//       const circleId =
//         circleIdOrRetired != 'retired' ? circleIdOrRetired : null;
//       const monthCircle = await ctx.prisma.monthCircle.upsert({
//         where: {
//           year_month_memberId: {
//             year,
//             month,
//             memberId,
//           },
//         },
//         create: {
//           year,
//           month,
//           memberId,
//           circleId,
//           state,
//         },
//         update: {
//           year,
//           month,
//           memberId,
//           circleId,
//           state,
//         },
//       });

//       // const member = await prisma.member.findUnique({
//       //   where: {
//       //     id: memberId,
//       //   },
//       // });
//       // const rest = createDiscordRestClient();
//       // await rest.post(
//       //   `${Routes.webhook(
//       //     '897470834162155560',
//       //     'i76bItNbaecp5Rn1J0vO4jAbb4RVMf32S4ZHWeu1BiAPwq_8X1CtnoHWXlyUg_kcef9G'
//       //   )}?wait=true`,
//       //   {
//       //     body: {
//       //       content: `${
//       //         member?.trainerName ?? member?.name
//       //       } さんが ${year}年${month}月の在籍希望に回答しました。 ${
//       //         process.env.BASE_URL
//       //       }/month_circles/${monthCircle.id}`,
//       //     },
//       //   }
//       // );

//       return {
//         monthCircle,
//       };
//     },
//   }
// );
