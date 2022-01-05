import { Circle, CircleId } from './../model/circle';
import { promises } from 'fs';
import { crawlUmastagram } from './../umastagram/crawler';
import { config } from 'dotenv';
import { Temporal } from 'proposal-temporal';

config();

(async () => {
  const lastDayOf2021 = Temporal.PlainDate.from({
    year: 2021,
    month: 12,
    day: 31,
  });
  await crawlUmastagram(
    'https://umastagram.com/circle/grade/graph/share/25f18213961bd79e85565850173179f5d98489384fa397162c07788cc942e995',
    Circle.shin,
    lastDayOf2021
  );
  await crawlUmastagram(
    'https://umastagram.com/circle/grade/graph/share/3ce8e825001b51c3b3d596f3027f3409a5170b62e95d6eb0a99a2a61fe345f68',
    Circle.ha,
    lastDayOf2021
  );
  await crawlUmastagram(
    'https://umastagram.com/circle/grade/graph/share/db086deeb172407f799e4a873834e14d91de526174deb54ba9b453b8150e21c5',
    Circle.jo,
    lastDayOf2021
  );
})();
