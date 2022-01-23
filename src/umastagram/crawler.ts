import { prisma } from './../database/prisma';
import { Temporal } from 'proposal-temporal';
import { Guild } from './../model/guild';
import { Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '../discord';
import puppeteer, { Page } from 'puppeteer';
import { type } from 'os';
import { Circle } from '../model';
import { CircleKey } from '@prisma/client';
export interface UmastagramPage {
  members: Array<UmastagramMember>;
  circle: UmastagramCircle;
}

type GradeTabRow = Pick<UmastagramMember, 'name' | 'total' | 'avg'>;
type PredictedTabRow = Pick<UmastagramMember, 'name' | 'predicted'>;
type GoalTabRow = Pick<UmastagramMember, 'name' | 'completeDay'>;

export interface UmastagramMember {
  name: string;
  total: string;
  avg: string;
  predicted: string;
  completeDay: string;
}

export interface UmastagramCircle {
  total: string;
  avg: string;
  predictedTotal: string;
  predictedAvg: string;
}

const toHalfWidthString = (str: string) => {
  return str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    })
    .replace('：', ':')
    .replace('　', ' ');
};

export async function crawlUmastagram(
  url: string,
  circle: Circle,
  plainDate: Temporal.PlainDate = Temporal.now
    .plainDate('iso8601', 'Asia/Tokyo')
    .subtract(Temporal.Duration.from({ days: 1 }))
): Promise<UmastagramPage> {
  const rest = createDiscordRestClient();
  const date = new Date(plainDate.toString());

  try {
    // await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
    //   body: {
    //     content: `${cirle.name}の ${yesterday.month}月${yesterday.day}日のファン数を取得しています...`,
    //   },
    // });

    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV == 'production',
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

    page.setViewport({ width: 1280, height: 960 });

    await page.goto(url, {
      waitUntil: 'networkidle2',
    });

    await selectTab(page, '実測');

    const memberGradeTables = await extractTableCells(
      page,
      'div.circle-member-grades table tbody tr'
    );

    const memberGrades: Array<GradeTabRow> = memberGradeTables.map((row) => {
      const [name, avg, total] = row;

      if (name == null || avg == null || total == null) {
        throw new Error(`Invalid cell ${row}`);
      }

      return {
        name,
        avg,
        total,
      };
    });

    await selectTab(page, '予測');
    const memberPredicatedTables = await extractTableCells(
      page,
      'div.circle-member-predict-grades table tbody tr'
    );

    const memberPredicts: Array<PredictedTabRow> = memberPredicatedTables.map(
      (row) => {
        const [name, _, __, predicted] = row;

        if (name == null || predicted == null) {
          throw new Error(`Invalid cell ${row}`);
        }

        return {
          name,
          predicted,
        };
      }
    );

    try {
      await selectTab(page, 'ノルマ');
    } catch (e) {
      await selectTab(page, '目標');
    }

    const memberGoalTables = await extractTableCells(
      page,
      'div.circle-member-predict-quota table tbody tr'
    );

    const memberGoals: Array<GoalTabRow> = memberGoalTables.map((row) => {
      const [name, _, __, completeDay] = row;

      if (name == null || completeDay == null) {
        throw new Error(`Invalid cell ${row}`);
      }

      return {
        name,
        completeDay,
      };
    });

    const members: Array<UmastagramMember> = memberGrades.map(
      (grade, index) => {
        const predict = memberPredicts[index];
        const goal = memberGoals[index];
        return {
          ...grade,
          ...predict,
          ...goal,
        };
      }
    );

    await selectTab(page, 'サークル');

    const circleTable = await extractTableCells(
      page,
      'div.circle-aggregate table tr'
    );

    const circleCells: Array<string> = circleTable.map((row) => {
      const [value] = row;

      if (value == null) {
        throw new Error(`Invalid cell ${row}`);
      }

      return value;
    });

    // const data = await page.screenshot({
    //   path: 'screenshot.png',
    //   encoding: 'binary',
    //   type: 'png',
    //   fullPage: true,
    // });

    await browser.close();

    const circleResult = {
      total: circleCells[0],
      avg: circleCells[1],
      predictedTotal: circleCells[2],
      predictedAvg: circleCells[3],
    };
    const result = {
      members: members,
      circle: circleResult,
    };

    const circleKey = circle.key;

    const dbMembers = await prisma.member.findMany({
      where: {
        circleKey,
      },
    });

    const circleFanCountData = {
      circle: circleKey,
      date,
      total: BigInt(circleResult.total.replaceAll(',', '')),
      avg: BigInt(circleResult.avg.replaceAll(',', '')),
      predicted: BigInt(circleResult.predictedAvg.replaceAll(',', '')),
      predictedAvg: BigInt(circleResult.predictedTotal.replaceAll(',', '')),
    };
    await prisma.$transaction([
      prisma.memberFanCount.deleteMany({
        where: { circle: circleKey, date },
      }),
      prisma.memberFanCount.createMany({
        data: [
          ...members.map((member) => {
            const dbMember = dbMembers.find(
              (m) => toHalfWidthString(m.name) == toHalfWidthString(member.name)
            );
            const memberId = dbMember?.id ?? null;
            return {
              circle: circleKey,
              date,
              name: member.name,
              memberId,
              total: BigInt(member.total.replaceAll(',', '')),
              avg: BigInt(member.avg.replaceAll(',', '')),
              predicted: BigInt(member.predicted.replaceAll(',', '')),
            };
          }),
        ],
        skipDuplicates: false,
      }),
      prisma.circleFanCount.upsert({
        where: {
          circle_date: {
            circle: circleKey,
            date,
          },
        },
        create: circleFanCountData,
        update: circleFanCountData,
      }),
    ]);

    await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
      body: {
        content: `${circle.name}の ${plainDate.toLocaleString(
          'ja-JP'
        )}のファン数を取得しました。`,
      },
      attachments: [
        {
          fileName: 'result.json',
          rawBuffer: Buffer.from(JSON.stringify(members, null, 2), 'utf-8'),
        },
      ],
    });

    return result;
  } catch (e) {
    await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
      body: {
        content:
          `${circle.name}の ${plainDate.toLocaleString(
            'ja-JP'
          )}のファン数を取得できませんでした。\n` +
          '```\n' +
          `${e}`.substring(0, 1800) +
          `\n` +
          '```',
      },
    });
    throw e;
  }
}

const extractTableCells: (
  page: Page,
  selector: string
) => Promise<Array<Array<string | null>>> = async (page, selector) => {
  const tableRows = await page.$$(selector);
  const rows: Array<Array<string | null>> = [];

  for (const row of tableRows) {
    const cells = await row.$$('td');
    rows.push(
      await Promise.all(
        cells.map((cell) => cell.evaluate((e) => e.textContent))
      )
    );
  }
  return rows;
};

const selectTab = async (page: Page, tabName: string) => {
  const tab = await findTab(page, tabName);

  if (!tab) {
    throw new Error(`Tab[${tabName}] not found`);
  }

  await tab.click({ delay: 100 });
  await page.waitForTimeout(2000);
};

const findTab = async (page: Page, tabName: string) => {
  const tabs = await page.$$('ul.p-tabview-nav span');

  for (const tab of tabs) {
    const textContent = await tab.evaluate((element) => element.textContent);
    if (textContent == tabName) {
      return tab;
    }
  }

  return null;
};
