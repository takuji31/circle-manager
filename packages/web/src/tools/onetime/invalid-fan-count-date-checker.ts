import { CircleKey } from '@prisma/client';
import { config } from 'dotenv';
import { prisma } from 'database';
import { convert, LocalDate, ZoneId } from '../../model/date';

config();

const fixedSuffix = '-fixed-20220315';
(async () => {
  //
  /**
   * 2月26日〜3月16日更新分(2月25日〜3月15日分)が2月24日〜3月14日のものとして記録されていた。
   * ただしUTCで0時以降(JSTで9時以降)に更新されたものは日付があっているのでそこだけは除外する
   * ↑に該当するもの一覧：
   * - 西京ファーム
   *   - 2/27
   *   - 2/28
   * - 序
   *   - 2/24
   *   - 3/1
   */
  const startDate = LocalDate.of(2022, 2, 24).toUTCDate();
  const endDate = LocalDate.of(2022, 3, 14).toUTCDate();

  console.log('Fix circle fan count');
  // 2/28日の更新は2回あって1回目のデータが不正(2/26日分)なので消す
  await prisma.circleFanCount.deleteMany({
    where: { id: 'cl05exgd300677oo3bbxna92g' },
  });

  const where = {
    date: {
      gte: startDate,
      lte: endDate,
    },
    OR: [
      {
        circle: {
          notIn: [CircleKey.Jo, CircleKey.Saikyo],
        },
      },
      {
        circle: CircleKey.Jo,
        date: {
          notIn: [
            LocalDate.of(2022, 2, 24).toUTCDate(),
            LocalDate.of(2022, 3, 1).toUTCDate(),
          ],
        },
      },
      {
        circle: CircleKey.Saikyo,
        date: {
          notIn: [
            LocalDate.of(2022, 2, 27).toUTCDate(),
            LocalDate.of(2022, 2, 28).toUTCDate(),
          ],
        },
      },
    ],
  };
  const circleFanCounts = await prisma.circleFanCount.findMany({
    where,
    orderBy: [
      {
        circle: 'asc',
      },
      {
        date: 'desc',
      },
    ],
  });

  console.log('Fix Invalid CircleFanCounts');
  for (const fanCount of circleFanCounts) {
    if (fanCount.id.endsWith(fixedSuffix)) {
      console.log('Skip fixed CircleFanCount ID: %s', fanCount.id);
    } else {
      console.log('Fixed CircleFanCount ID: %s', fanCount.id);
      const updated = await prisma.circleFanCount.update({
        where: { id: fanCount.id },
        data: {
          id: fanCount.id + fixedSuffix,
          date: LocalDate.fromUTCDate(fanCount.date).plusDays(1).toUTCDate(),
        },
      });
      console.log('Fixed CircleFanCount %s', updated);
    }
  }

  const maybeInvalidFanCounts = await prisma.memberFanCount.findMany({
    where: {
      circle: CircleKey.Jo,
      date: LocalDate.of(2022, 2, 26).toUTCDate(),
    },
  });
  console.log('Delete invalid fan counts');
  for (const invalidFanCount of maybeInvalidFanCounts) {
    if (!invalidFanCount.id.endsWith(fixedSuffix)) {
      await prisma.memberFanCount.delete({
        where: {
          id: invalidFanCount.id,
        },
      });
      console.log(
        'Deleted invalid MemberFanCount ID: %s name: %s date: %s',
        invalidFanCount.id,
        invalidFanCount.name,
        invalidFanCount.date
      );
    }
  }

  const memberFanCounts = await prisma.memberFanCount.findMany({
    where,
    orderBy: [
      {
        circle: 'asc',
      },
      {
        date: 'desc',
      },
    ],
  });

  console.log('Fix Invalid MemberFanCounts');
  for (const fanCount of memberFanCounts) {
    if (fanCount.id.endsWith(fixedSuffix)) {
      console.log('Skip fixed MemberFanCount ID: %s', fanCount.id);
    } else {
      console.log('Fixed MemberFanCount ID: %s', fanCount.id);
      const updated = await prisma.memberFanCount.update({
        where: { id: fanCount.id },
        data: {
          id: fanCount.id + fixedSuffix,
          date: LocalDate.fromUTCDate(fanCount.date).plusDays(1).toUTCDate(),
        },
      });
      console.log('Fixed MemberFanCount %s', updated);
    }
  }
})();
