import * as functions from 'firebase-functions';
import { Page, launch } from 'puppeteer';

interface UmastagramPage {
  members: Array<UmastagramMember>;
  circle: UmastagramCircle;
}

type GradeTabRow = Pick<UmastagramMember, 'name' | 'total' | 'avg'>;
type PredictedTabRow = Pick<UmastagramMember, 'name' | 'predicted'>;
type GoalTabRow = Pick<UmastagramMember, 'name' | 'completeDay'>;

interface UmastagramMember {
  name: string;
  total: string;
  avg: string;
  predicted: string;
  completeDay: string;
}

interface UmastagramCircle {
  total: string;
  avg: string;
  predictedTotal: string;
  predictedAvg: string;
}

async function crawlUmastagram(url: string): Promise<UmastagramPage> {
  const browser = await launch({
    headless: process.env.NODE_ENV == 'production',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

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
      const [name, , , predicted] = row;

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
    const [name, , , completeDay] = row;

    if (name == null || completeDay == null) {
      throw new Error(`Invalid cell ${row}`);
    }

    return {
      name,
      completeDay,
    };
  });

  const members: Array<UmastagramMember> = memberGrades.map((grade, index) => {
    const predict = memberPredicts[index];
    const goal = memberGoals[index];
    return {
      ...grade,
      ...predict,
      ...goal,
    };
  });

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

  return result;
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

export const getUmastagramFanCounts = functions
  .runWith({
    memory: '512MB',
  })
  .https.onRequest(async (request, response) => {
    const { url } = request.query;
    if (!url) {
      response.status(400).json({ error: 'URL required' });
      return;
    }
    if (typeof url != 'string') {
      response.status(400).json({ error: 'URL can contains only one' });
      return;
    }
    try {
      const result = await crawlUmastagram(url);
      response.json(result);
    } catch (e) {
      response.status(500).json({ error: `${e}` });
    }
  });
