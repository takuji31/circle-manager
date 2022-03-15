import {
  convert,
  DateTimeFormatter,
  LocalDate,
  nativeJs,
  TemporalAdjusters,
  ZonedDateTime,
  ZoneId,
} from '@js-joda/core';
import '@js-joda/timezone';
import { Locale } from '@js-joda/locale_ja';

export const DateFormats = {
  ymd: DateTimeFormatter.ofPattern('yyyy/MM/dd').withLocale(Locale.JAPAN),
  dateWithHour: DateTimeFormatter.ofPattern('yyyy/MM/dd (E) H時').withLocale(
    Locale.JAPAN
  ),
  dateTime: DateTimeFormatter.ofPattern('yyyy/MM/dd (E) HH:mm:ss').withLocale(
    Locale.JAPAN
  ),
};

const JST = ZoneId.of('Asia/Tokyo');

export * from '@js-joda/core';

declare module '@js-joda/core' {
  namespace LocalDate {
    function today(): LocalDate;
    function yesterday(): LocalDate;
    function firstDayOfThisMonth(): LocalDate;
    function firstDayOfNextMonth(): LocalDate;
    function fromUTCDate(date: Date): LocalDate;
  }

  interface LocalDate {
    isSameMonth(other: LocalDate): boolean;
    toUTCDate(): Date;
  }
  namespace ZonedDateTime {
    function nowJST(): ZonedDateTime;
    function fromDate(date: Date): ZonedDateTime;
  }
}
LocalDate.today = () => LocalDate.now(JST);
LocalDate.yesterday = () => LocalDate.today().minusDays(1);
LocalDate.fromUTCDate = (date) => LocalDate.from(nativeJs(date, ZoneId.UTC));
LocalDate.firstDayOfThisMonth = () =>
  LocalDate.today().with(TemporalAdjusters.firstDayOfMonth());
LocalDate.firstDayOfNextMonth = () =>
  LocalDate.today().with(TemporalAdjusters.firstDayOfNextMonth());
ZonedDateTime.nowJST = () => ZonedDateTime.now(JST);
ZonedDateTime.fromDate = (date) =>
  ZonedDateTime.from(nativeJs(date)).withZoneSameInstant(JST);

LocalDate.prototype.isSameMonth = function (other) {
  return this.year() == other.year() && this.monthValue() == other.monthValue();
};
LocalDate.prototype.toUTCDate = function () {
  return convert(this, ZoneId.UTC).toDate();
};
