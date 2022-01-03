import { Temporal } from 'proposal-temporal';
import { Guild } from './../model/guild';
import { Routes } from 'discord-api-types/v9';
import { createDiscordRestClient } from '../discord';
import puppeteer, { Page } from 'puppeteer';
import { type } from 'os';
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
  predicatedTotal: string;
  predicatedAvg: string;
}

export const crawlUmastagram: (
  url: string,
  circle: { id: string; name: string }
) => Promise<UmastagramPage> = async (url, circle) => {
  const rest = createDiscordRestClient();
  const yesterday = Temporal.now
    .zonedDateTime(Temporal.Calendar.from('iso8601'), 'Asia/Tokyo')
    .subtract(Temporal.Duration.from({ days: 1 }))
    .toPlainDate();
  // await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
  //   body: {
  //     content: `${cirle.name}の ${yesterday.month}月${yesterday.day}日のファン数を取得しています...`,
  //   },
  // });

  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV == 'production',
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

  await selectTab(page, '目標');
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

  const members: Array<UmastagramMember> = memberGrades.map((grade, index) => {
    const { name } = grade;
    const predict = memberPredicts[index];
    const goal = memberGoals[index];
    return {
      ...grade,
      ...predict,
      ...goal,
    };
  });

  // const data = await page.screenshot({
  //   path: 'screenshot.png',
  //   encoding: 'binary',
  //   type: 'png',
  //   fullPage: true,
  // });

  // await rest.post(Routes.channelMessages(Guild.channelIds.admin), {
  //   body: {
  //     content: `${circle.name}の ${yesterday.month}月${yesterday.day}日のファン数を取得しました。`,
  //   },
  //   attachments: [
  //     {
  //       fileName: 'result.json',
  //       rawBuffer: Buffer.from(JSON.stringify(members, null, 2), 'utf-8'),
  //     },
  //   ],
  // });

  await browser.close();

  return {
    members: members,
    circle: {
      total: '0',
      avg: '0',
      predicatedAvg: '0',
      predicatedTotal: '0',
    },
  };
};

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
  await page.waitForTimeout(1000);
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
