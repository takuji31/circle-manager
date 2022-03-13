import { DateTimeFormatter } from '@js-joda/core';
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
