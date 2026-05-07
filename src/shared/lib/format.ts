const krwFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("ko-KR");

const percentFormatter = new Intl.NumberFormat("ko-KR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatKrw = (value: number): string => krwFormatter.format(value);

export const formatNumber = (value: number): string => numberFormatter.format(value);

export const formatPercent = (value: number): string => `${percentFormatter.format(value)}%`;

/** 부호 포함(+/-/0) */
export const formatSignedKrw = (value: number): string => {
  if (value > 0) return `+${krwFormatter.format(value)}`;
  return krwFormatter.format(value);
};

export const formatSignedPercent = (value: number): string => {
  if (value > 0) return `+${percentFormatter.format(value)}%`;
  return `${percentFormatter.format(value)}%`;
};
