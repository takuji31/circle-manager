import _dayjs, { PluginFunc } from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import arraySupport from 'dayjs/plugin/arraySupport';
import 'dayjs/locale/ja';

declare global {
  var _isDayjsSetupCompleted: boolean;
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
    writable: false,
    value: function (this: _dayjs.Dayjs, value?: number) {
      if (value === undefined) {
        return baseMonthFn.bind(this)() + 1;
      } else {
        value = value - 1;
        return baseMonthFn.bind(this)(value);
      }
    },
  });
};

(() => {
  if (globalThis._isDayjsSetupCompleted) {
    return;
  }

  _dayjs.extend(localizedFormat);
  _dayjs.extend(isLeapYear);
  _dayjs.extend(utc);
  _dayjs.extend(timezone);
  _dayjs.extend(monthsOneIndexed);
  _dayjs.extend(duration);
  _dayjs.extend(arraySupport);
  _dayjs.locale('ja');
  _dayjs.tz.setDefault('Asia/Tokyo');

  globalThis._isDayjsSetupCompleted = true;
})();

export const dayjs: typeof _dayjs = _dayjs;
