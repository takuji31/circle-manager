export const Emoji = {
  a: '🇦',
  b: '🇧',
  c: '🇨',
  d: '🇩',
  eyes: '👀',
  pen: '✏️',
} as const;
type Emoji = typeof Emoji[keyof typeof Emoji];

export const MonthSurveyEmoji = {
  saikyo: Emoji.a,
  umamusume: Emoji.b,
  leave: Emoji.c,
  ob: Emoji.d,
} as const;
type MonthSurveyEmoji = typeof MonthSurveyEmoji[keyof typeof MonthSurveyEmoji];

export function isValidMonthSurveyEmoji(
  emoji: string
): emoji is MonthSurveyEmoji {
  return !!Object.values(MonthSurveyEmoji).find(
    (monthSurveyEmoji) => monthSurveyEmoji == emoji
  );
}
