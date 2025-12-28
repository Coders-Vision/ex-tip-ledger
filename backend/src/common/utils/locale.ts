export function parseLocaleNumber(
  locale: string,
  currency: string,
  num: number,
) {
  const currencyFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  });
  const getStrippedValue = currencyFormatter
    .format(num)
    .replace(/[^\d.-]/g, '');

  return parseFloat(getStrippedValue);
}
