import { Temporal } from "proposal-temporal";
import { JST } from "../model/time";

export interface YearMonth {
  year: string;
  month: string;
}

export interface ThisAndNextMonth {
  thisYear: string;
  thisMonth: string;
  nextYear: string;
  nextMonth: string;
}

export const thisMonth: () => YearMonth = () => {
  const yearMonth = Temporal.now.zonedDateTimeISO(JST).toPlainYearMonth();
  return {
    year: yearMonth.year.toString(),
    month: yearMonth.month.toString(),
  };
};

export const nextMonth: () => YearMonth = () => {
  const yearMonth = Temporal.now
    .zonedDateTimeISO(JST)
    .toPlainYearMonth()
    .add(Temporal.Duration.from({ months: 1 }));
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
