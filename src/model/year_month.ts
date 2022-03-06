import { dayjs } from './date';
import { LocalDate } from '@js-joda/core';

export interface YearMonth {
  year: number;
  month: number;
}

export const thisMonthInt: () => YearMonth = () => {
  const now = LocalDate.now().withDayOfMonth(1);
  return {
    year: now.year(),
    month: now.monthValue(),
  };
};

export const nextMonthInt: () => YearMonth = () => {
  const nextMonth = LocalDate.now().withDayOfMonth(1).plusMonths(1);
  return {
    year: nextMonth.year(),
    month: nextMonth.monthValue(),
  };
};
