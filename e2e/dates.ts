/** `YYYY-MM-DD` for `daysAgo` days before today in the given zone. */
export function localDate(daysAgo: number, zone = 'Asia/Beirut'): string {
  const date = new Date(Date.now() - daysAgo * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** A `datetime-local` value: the date `daysAgo` days back at `time`. */
export function localDateTime(daysAgo: number, time: string, zone = 'Asia/Beirut'): string {
  return `${localDate(daysAgo, zone)}T${time}`;
}
