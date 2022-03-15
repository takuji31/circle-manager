import { convert } from '../../model/date';
import { list, nonNull, objectType } from 'nexus';
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
        return prisma.memberFanCount.findMany({
          where: {
            date: convert(date).toDate(),
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
