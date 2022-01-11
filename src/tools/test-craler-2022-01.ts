import { Circle } from './../model/circle';
import { crawlUmastagram } from './../umastagram/crawler';
import { config } from 'dotenv';

config();

(async () => {
  await crawlUmastagram(
    'https://umastagram.com/circle/grade/graph/share/bd691b71078f225ecd08e6aa8dc0fe83cadf670cad32eaf2b1451ae742f2a7df',
    Circle.shin
  );
  await crawlUmastagram(
    'https://umastagram.com/circle/grade/graph/share/eb3222eadbc8169aeb819b5f40be3bbfaaea315057c5c85ec374c867d5bf6336',
    Circle.ha
  );
  await crawlUmastagram(
    'https://umastagram.com/circle/grade/graph/share/233c70279901bbd724fceb51349af1b23b72e0593ab1e4f961991772c877b6cf',
    Circle.jo
  );
})();
