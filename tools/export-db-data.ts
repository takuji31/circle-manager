import { prisma } from "@/database";
import type { DbTableData } from "@/model";
import { config } from "dotenv";
import * as fs from "fs/promises";
import { logger } from "~/lib/logger";

config();

(async () => {
  const data: DbTableData = {
    members: await prisma.member.findMany({
      orderBy: [
        { circleKey: "asc" },
        { circleRole: "asc" },
        { joinedAt: "asc" },
      ],
    }),
    monthCircles: await prisma.monthCircle.findMany({
      orderBy: [
        { year: "asc" },
        { month: "asc" },
        { currentCircleKey: "asc" },
        { state: "asc" },
      ],
    }),
    monthSurveys: await prisma.monthSurvey.findMany({
      orderBy: [{ year: "asc" }, { month: "asc" }],
    }),
    monthSurveyAnswers: await prisma.monthSurveyAnswer.findMany({
      orderBy: [{ year: "asc" }, { month: "asc" }, { memberId: "asc" }],
    }),
    signUps: await prisma.signUp.findMany({ orderBy: [{ id: "asc" }] }),
    umastagramMemberFanCount: await prisma.umastagramMemberFanCount.findMany({
      orderBy: [
        { date: "asc" },
        { member: { circleKey: "asc" } },
        { member: { circleRole: "asc" } },
        { member: { joinedAt: "asc" } },
      ],
    }),
    umastagramCircleFanCount: await prisma.umastagramCircleFanCount.findMany({
      orderBy: [{ date: "asc" }, { circle: "asc" }],
    }),
    memberFanCounts: await prisma.memberFanCount.findMany({
      orderBy: [
        { date: "asc" },
        { circleKey: "asc" },
        { order: "asc" },
      ],
    }),
    circleFanCounts: await prisma.circleFanCount.findMany({
      orderBy: [
        { date: "asc" },
        { circleKey: "asc" },
      ],
    }),
    screenShots: await prisma.screenShot.findMany({
      orderBy: [
        { circleKey: "asc" },
        { date: "asc" },
        { createdAt: "asc" },
      ],
    }),
    personalChannels: await prisma.personalChannel.findMany({
      orderBy: { id: "asc" },
    }),
  };

  // https://stackoverflow.com/questions/62539236/how-to-parse-a-json-data-type-bigint-in-typescript
  await fs.writeFile(
    "./data.json",
    JSON.stringify(
      data,
      function replacer(key: string, value: any): any {
        if (typeof value === "bigint") {
          return { __bigintval__: value.toString() };
        }
        return value;
      },
      2,
    ),
  );
})().catch((e) => logger.error(e));
