import { Temporal } from 'proposal-temporal';

export function toDate(temporalDate: Temporal.PlainDate): Date {
  return new Date(temporalDate.toString());
}
