import type { LocalDate, Period } from "@/model";

export interface YMD {
  year: number;
  month: number;
  day: number;
}

export function dateToYMD(date: LocalDate): YMD {
  return {
    year: date.year(),
    month: date.monthValue(),
    day: date.dayOfMonth(),
  };
}

export function getDatesFrom({
  start,
  period,
}: {
  start: LocalDate;
  period: Period;
}) {
  const days = period.days();
  const dates: Array<LocalDate> = [];
  const isPlus = days > 0;
  const steps = Math.abs(days);

  for (let i = 0; steps > i; i++) {
    dates.push(isPlus ? start.plusDays(i) : start.minusDays(i));
  }
  return dates.map((date) => dateToYMD(date));
}
