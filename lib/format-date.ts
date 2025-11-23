// lib/format-date.ts

interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  locale?: string
}

export function formatDate(
  date: string | number | Date,
  options?: FormatDateOptions
): string {
  const { locale = 'ko-KR', ...dateTimeFormatOptions } = options || {}

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...dateTimeFormatOptions
  })

  return formatter.format(new Date(date))
}
