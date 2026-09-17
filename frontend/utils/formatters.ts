export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export function formatMatchPercent(score: number): string {
  return `${Math.round(score)}% match`;
}
