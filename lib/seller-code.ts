// lib/seller-code.ts

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1

export function generateSellerCode(): string {
  let code = 'USR-';
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export function isValidSellerCode(code: string): boolean {
  return /^USR-[A-HJ-NP-Z2-9]{6}$/.test(code);
}