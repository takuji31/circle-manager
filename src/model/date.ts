import { Temporal } from 'proposal-temporal';
import dayjs, { PluginFunc } from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import arraySupport from 'dayjs/plugin/arraySupport';
import 'dayjs/locale/ja';

export function toDate(temporalDate: Temporal.PlainDate): Date {
  return new Date(temporalDate.toString());
}

export function toDateTime(temporalDate: Temporal.ZonedDateTime): Date {
  return new Date(temporalDate.epochMilliseconds);
}

export function toPlainDate(legacyDate: Date): Temporal.PlainDate {
  return Temporal.PlainDate.from({
    year: legacyDate.getFullYear(),
    month: legacyDate.getMonth() + 1,
    day: legacyDate.getDate(),
  });
}

const monthsOneIndexed: PluginFunc<unknown> = (_, dayjsClass, __) => {
  if ((dayjsClass.prototype as any).zeroIndexedMonth) {
    return;
  }
  const baseMonthFn = dayjsClass.prototype.month;
  Object.defineProperty(dayjsClass.prototype, 'zeroIndexedMonth', {
    configurable: true,
    enumerable: false,
    writable: false,
    value: baseMonthFn,
  });
  Object.defineProperty(dayjsClass.prototype, 'month', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: function (this: dayjs.Dayjs, value?: number) {
      if (value === undefined) {
        return baseMonthFn.bind(this)() + 1;
      } else {
        value = value - 1;
        return baseMonthFn.bind(this)(value);
      }
    },
  });
  Object.defineProperty(dayjsClass.prototype, 'month', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: function (this: dayjs.Dayjs, value?: number) {
      if (value === undefined) {
        return baseMonthFn.bind(this)() + 1;
      } else {
        value = value - 1;
        return baseMonthFn.bind(this)(value);
      }
    },
  });
};

let _dayjsSetupCompleted = false;

export const setupDayjs = () => {
  if (_dayjsSetupCompleted) {
    return;
  }
  dayjs.extend(localizedFormat);
  dayjs.extend(isLeapYear);
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(monthsOneIndexed);
  dayjs.extend(duration);
  dayjs.extend(arraySupport);
  dayjs.locale('ja');
  dayjs.tz.setDefault('Asia/Tokyo');
  _dayjsSetupCompleted = true;
};
