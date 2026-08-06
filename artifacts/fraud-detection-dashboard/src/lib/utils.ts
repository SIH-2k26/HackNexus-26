import { twMerge } from 'tailwind-merge';

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBankName(bankId: string): string {
  if (!bankId) return bankId;
  const lower = bankId.toLowerCase().trim();
  if (lower === 'bank_0' || lower === 'bank 0') return 'SBI';
  if (lower === 'bank_1' || lower === 'bank 1') return 'HDFC';
  if (lower === 'bank_2' || lower === 'bank 2') return 'ICICI';
  if (lower === 'bank_3' || lower === 'bank 3') return 'Axis Bank';
  return bankId;
}
