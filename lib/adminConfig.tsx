// lib/adminConfig.ts
export const ADMIN_EMAILS = [
  "admin@pixelssurprise.com",
  // Add your exact login email here in lowercase:
  "pixelssurprise@gmail.com", 
];

export function checkIsAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.map((e) => e.toLowerCase().trim()).includes(email.toLowerCase().trim());
}