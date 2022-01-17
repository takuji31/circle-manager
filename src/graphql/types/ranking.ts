import { list, nonNull, objectType } from 'nexus';
import { Temporal } from 'proposal-temporal';
import { Circle } from '../../model';
import { MemberFanCount } from './member_fan_count';

export const Ranking = objectType({
  name: 'Ranking',
  description: '特定の日または月のファン数ランキング',
  definition(t) {
    t.nonNull.date('date');
    t.nonNull.field('fanCounts', {
      type: nonNull(list(nonNull(MemberFanCount))),
      resolve({ date }, _, { prisma }) {
        const d = date as Temporal.PlainDate;
        return prisma.memberFanCount.findMany({
          where: {
            date: new Date(d.toString()),
            circle: {
              // TODO: with month survey
              in: [Circle.shin.key, Circle.ha.key, Circle.jo.key],
            },
          },
          orderBy: {
            total: 'desc',
          },
        });
      },
    });
  },
});
