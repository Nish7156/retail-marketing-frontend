export const PHONE_DEFAULT = "+91 ";
export const PHONE_PREFIX = "+91";

const INDIAN_PHONE_DIGITS = 10;
const COUNTRY_CODE = "91";

const ONLY_DIGITS_AND_PLUS_SPACE = /^[\d+\s]*$/;

export function getDigitsOnly(displayValue: string): string {
  const digits = (displayValue || "").replace(/\D/g, "");
  return digits.startsWith(COUNTRY_CODE) ? digits.slice(COUNTRY_CODE.length, COUNTRY_CODE.length + INDIAN_PHONE_DIGITS) : digits.slice(0, INDIAN_PHONE_DIGITS);
}

export function formatPhoneDisplay(value: string): string {
  const cleaned = value.replace(/[^\d+\s]/g, "");
  const digits = cleaned.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 0) return PHONE_DEFAULT;
  const tenDigits = digits.startsWith(COUNTRY_CODE)
    ? digits.slice(COUNTRY_CODE.length, COUNTRY_CODE.length + INDIAN_PHONE_DIGITS)
    : digits.slice(0, INDIAN_PHONE_DIGITS);
  return "+91 " + tenDigits;
}

export function getPhoneForApi(displayValue: string): string {
  const digits = displayValue.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith(COUNTRY_CODE)) return `+${digits}`;
  return displayValue.trim().startsWith("+") ? displayValue.trim() : `+91${digits}`;
}

export function validatePhone(displayValue: string): boolean {
  const digits = displayValue.replace(/\D/g, "");
  return (digits.length === 10) || (digits.length === 12 && digits.startsWith(COUNTRY_CODE));
}

export function phoneErrorMessage(displayValue: string): string {
  const raw = displayValue || "";
  if (!ONLY_DIGITS_AND_PLUS_SPACE.test(raw)) return "Only numbers allowed.";
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "Phone number is required.";
  if (!validatePhone(displayValue)) return "Enter a valid 10-digit Indian phone number.";
  return "";
}
