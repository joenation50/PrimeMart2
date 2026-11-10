// lib/format.ts
import { format, formatDistanceToNow } from 'date-fns';

export function formatPrice(amount: number, currency = 'NGN'): string {
  const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency + ' ';
  return `${symbol}${amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatPhone(phone: string): string {
  // Display masking: +234 80• ••• 1234
  if (phone.length < 6) return phone;
  const last4 = phone.slice(-4);
  const prefix = phone.slice(0, 4);
  return `${prefix} •• ••• ${last4}`;
}

export function formatCompact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
}

export function daysUntil(date: string | Date): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}