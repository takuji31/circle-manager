import { Temporal } from 'proposal-temporal';

export function toDate(temporalDate: Temporal.PlainDate): Date {
  return new Date(temporalDate.toString());
}

export function toDateTime(temporalDate: Temporal.ZonedDateTime): Date {
  return new Date(temporalDate.epochMilliseconds);
}

export function toPlainDate(legacyDate: Date): Temporal.PlainDate {
  return Temporal.PlainDate.from({
    year: legacyDate.getFullYear(),
    month: legacyDate.getMonth() + 1,
    day: legacyDate.getDate(),
  });
}
