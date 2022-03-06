import { LocalDate } from '@js-joda/core';
import { startOfMonth } from './date';
describe('startOfMonth', () => {
  it('2022年3月1日→2022年3月1日', () => {
    expect(LocalDate.of(2022, 3, 1).with(startOfMonth)).toStrictEqual(
      LocalDate.of(2022, 3, 1)
    );
  });
  it('2022年3月6日→2022年3月1日', () => {
    expect(LocalDate.of(2022, 3, 6).with(startOfMonth)).toStrictEqual(
      LocalDate.of(2022, 3, 1)
    );
  });
  it('2022年3月31日→2022年3月1日', () => {
    expect(LocalDate.of(2022, 3, 31).with(startOfMonth)).toStrictEqual(
      LocalDate.of(2022, 3, 1)
    );
  });
});
