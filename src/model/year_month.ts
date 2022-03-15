import { LocalDate } from './date';

export interface YearMonth {
  year: number;
  month: number;
}

export const thisMonthInt: () => YearMonth = () => {
  const now = LocalDate.firstDayOfThisMonth();
  return {
    year: now.year(),
    month: now.monthValue(),
  };
};

export const nextMonthInt: () => YearMonth = () => {
  const nextMonth = LocalDate.firstDayOfNextMonth();
  return {
    year: nextMonth.year(),
    month: nextMonth.monthValue(),
  };
};
