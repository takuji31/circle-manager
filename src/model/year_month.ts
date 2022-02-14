import { dayjs } from './date';

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
  const now = dayjs();
  return {
    year: now.year(),
    month: now.month(),
  };
};

export const nextMonthInt: () => YearMonth = () => {
  const nextMonth = dayjs()
    .startOf('month')
    .add(dayjs.duration({ months: 1 }));
  return {
    year: nextMonth.year(),
    month: nextMonth.month(),
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
