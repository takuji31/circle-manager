import { promises } from 'fs';
import { crawlUmastagram } from './../umastagram/crawler';
import { config } from 'dotenv';

config();

(async () => {
  const data = await crawlUmastagram(
    'https://umastagram.com/circle/grade/graph/share/bd691b71078f225ecd08e6aa8dc0fe83cadf670cad32eaf2b1451ae742f2a7df',
    { id: '863398236474834944', name: 'シン・ウマ娘愛好会' }
  );
  await promises.writeFile('result.json', JSON.stringify(data, null, 2));
})();
