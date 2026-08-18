import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBankName(bankId: string): string {
  if (!bankId) return bankId;
  const lower = bankId.toLowerCase().trim();
  if (lower === 'bank_0' || lower === 'bank 0') return 'Bank 0';
  if (lower === 'bank_1' || lower === 'bank 1') return 'Bank 1';
  if (lower === 'bank_2' || lower === 'bank 2') return 'Bank 2';
  if (lower === 'bank_3' || lower === 'bank 3') return 'Bank 3';
  return bankId;
}

export function getAuthApiKey(): string {
  try {
    const raw = localStorage.getItem('vaultic_auth_session');
    if (!raw) return '';
    const session = JSON.parse(raw);
    return session?.apiKey || '';
  } catch {
    return '';
  }
}

export function getAuthSession(): Record<string, any> | null {
  try {
    const raw = localStorage.getItem('vaultic_auth_session');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
