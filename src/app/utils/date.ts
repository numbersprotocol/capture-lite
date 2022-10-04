export function calcDaysBetweenDates(a: Date, b: Date) {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const millisecondsInOneDay = 1000 * 60 * 60 * 24;
  const diffTime = a.getTime() - b.getTime();
  const diffDays = Math.ceil(diffTime / millisecondsInOneDay);
  return diffDays;
}

export function secondSince(timestamp: number) {
  const now = Date.now();
  const milliseconds = 1000;
  return Math.ceil((now - timestamp) / milliseconds);
}
