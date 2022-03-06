import { dayjs } from './date';

export interface YearMonth {
  year: number;
  month: number;
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
