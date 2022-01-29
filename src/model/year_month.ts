import { Temporal } from 'proposal-temporal';
import { JST } from './time';

export interface StringYearMonth {
  year: string;
  month: string;
}
export interface YearMonth {
  year: number;
  month: number;
}

export interface ThisAndNextMonth {
  thisYear: string;
  thisMonth: string;
  nextYear: string;
  nextMonth: string;
}

export const thisMonthInt: () => YearMonth = () => {
  const yearMonth = Temporal.now.zonedDateTimeISO(JST).toPlainYearMonth();
  return {
    year: yearMonth.year,
    month: yearMonth.month,
  };
};

export const nextMonthInt: () => YearMonth = () => {
  const yearMonth = Temporal.now
    .zonedDateTimeISO(JST)
    .toPlainYearMonth()
    .add(Temporal.Duration.from({ months: 1 }));
  return {
    year: yearMonth.year,
    month: yearMonth.month,
  };
};

export const thisMonth: () => StringYearMonth = () => {
  const yearMonth = thisMonthInt();
  return {
    year: yearMonth.year.toString(),
    month: yearMonth.month.toString(),
  };
};

export const nextMonth: () => StringYearMonth = () => {
  const yearMonth = nextMonthInt();
  return {
    year: yearMonth.year.toString(),
    month: yearMonth.month.toString(),
  };
};

export const thisAndNextMonth: () => ThisAndNextMonth = () => {
  const thisYearMonth = thisMonth();
  const nextYearMonth = nextMonth();
  return {
    thisYear: thisYearMonth.year,
    thisMonth: thisYearMonth.month,
    nextYear: nextYearMonth.year,
    nextMonth: nextYearMonth.month,
  };
};
