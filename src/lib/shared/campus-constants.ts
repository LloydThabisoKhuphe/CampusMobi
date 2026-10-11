// Shared domain constants + institutional email rules.
// Imported by both the client store and the server functions.

export const STUDENT_EMAIL_DOMAIN = "iws.ac.za";
export const STUDENT_EMAIL_PATTERN = /^\d{9}@iws\.ac\.za$/i;
export const STAFF_EMAIL_PATTERN = /^[a-z]\.[a-z]+@wsu\.ac\.za$/i;

// Checks the INSTITUTIONAL email format only (student OR staff pattern) —
// used for the sign-in form, where the address is always @iws.ac.za or
// @wsu.ac.za. NOT used for the personal-email field at registration; that
// one is validated with a plain generic-email regex instead (see
// campus-store.tsx's register()), since a Gmail address should fail this
// check by design.
export function validateCampusEmail(email: string): string | null {
  const value = email.trim().toLowerCase();
  if (!value) return "Enter your university email address.";
  if (STUDENT_EMAIL_PATTERN.test(value) || STAFF_EMAIL_PATTERN.test(value)) return null; // null = valid, matching a validator convention used throughout the app
  return `Use your student email in the format 123456789@${STUDENT_EMAIL_DOMAIN}`;
}

// Boolean convenience wrapper around validateCampusEmail — for call sites
// that just need yes/no, not the specific error message.
export function isValidCampusEmail(email: string): boolean {
  return validateCampusEmail(email) === null;
}

// 2026 approved administration fees (WSU Student Debtors fee schedule) + Gym access,
// which isn't on that schedule but was requested for the payment demo.
export type FeeType = { id: string; label: string; amount: number };

export const FEE_TYPES: FeeType[] = [
  { id: "remarking", label: "Remarking", amount: 530 },
  { id: "academic-record", label: "Academic Record", amount: 110 },
  { id: "credit-record", label: "Credit Record", amount: 120 },
  { id: "duplicate-results", label: "Duplicate Results", amount: 110 },
  { id: "lost-certificate", label: "Lost Certificate", amount: 270 },
  { id: "exemption", label: "Exemption", amount: 615 },
  { id: "student-card-replacement", label: "Student Card Replacement", amount: 140 },
  { id: "supplementary", label: "Supplementary", amount: 310 },
  { id: "special-exams", label: "Special Exams", amount: 360 },
  { id: "exams-only", label: "Exams Only", amount: 910 },
  { id: "aegrotat", label: "Aegrotat", amount: 360 },
  { id: "gym", label: "Gym Access", amount: 150 },
];
