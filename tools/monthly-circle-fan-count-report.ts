import { prisma } from "@/database";
import { Circles, DateTimeFormatter, LocalDate } from "@/model";
import { CircleKey } from "@prisma/client";
import { config } from "dotenv";
import { logger } from "~/lib/logger";

config();

type CircleFanCount = {
  month: LocalDate;
  Saikyo: BigInt;
  Shin: BigInt;
  Jo: BigInt;
  Ha: BigInt;
};

(async () => {
  const firstDayOfThisMonth = LocalDate.firstDayOfThisMonth();
  const months = [
    firstDayOfThisMonth,
    firstDayOfThisMonth.minusMonths(1),
    firstDayOfThisMonth.minusMonths(2),
  ];

  const circleFanCounts: Array<CircleFanCount> = [];

  for (const month of months) {
    const monthCircleFanCount: CircleFanCount = {
      month,
      Saikyo: BigInt(0),
      Shin: BigInt(0),
      Ha: BigInt(0),
      Jo: BigInt(0),
    };
    for (const circle of Object.values(CircleKey)) {
      const circleFanCount = await prisma.umastagramCircleFanCount.findFirst({
        where: {
          circle,
          date: {
            gte: month.toUTCDate(),
            lt: month.plusMonths(1).toUTCDate(),
          },
        },
        orderBy: [
          {
            total: "desc",
          },
          {
            date: "desc",
          },
        ],
      });
      monthCircleFanCount[circle] = circleFanCount?.predictedAvg ?? BigInt(0);
    }
    circleFanCounts.push(monthCircleFanCount);
  }

  for (const circleFanCount of circleFanCounts) {
    logger.info(
      circleFanCount.month.format(
        DateTimeFormatter.ofPattern("yyyy年MMのファン数平均"),
      ),
    );
    for (const key of Object.values(CircleKey)) {
      const count = circleFanCount[key];
      console.info(
        "%s: %d",
        Circles.findByCircleKey(key).name,
        count.toString(),
      );
    }
  }
})();
