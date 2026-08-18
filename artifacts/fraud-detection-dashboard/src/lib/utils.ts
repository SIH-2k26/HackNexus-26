import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBankName(bankId: string): string {
  if (!bankId) return bankId;
  const match = bankId.trim().match(/^bank[_\s](\d+)$/i);
  if (match) {
    return `Bank ${match[1]}`;
  }
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
