import { Circle } from './../model/circle';
import { crawlUmastagram } from './../umastagram/crawler';
import { config } from 'dotenv';

config();

(async () => {
  await crawlUmastagram(
    'https://umastagram.com/circle/grade/graph/share/18cf5dbf661ac91f7d94f76a95d775ed11137370c201fce88d4a92e752bf8cdb',
    Circle.shin
  );
  await crawlUmastagram(
    'https://umastagram.com/circle/grade/graph/share/2407945d2c1891151fc0762f206edc257dbfc1d470fbd0f081dbd4c97aae561e',
    Circle.ha
  );
  await crawlUmastagram(
    'https://umastagram.com/circle/grade/graph/share/c75437c75050644a9b9785bcd98509b8e0b2f5f76de93c8c3d30b46dc35336d1',
    Circle.jo
  );
})();
