/**
 * Safe, deterministic date & time formatting utilities for SSR & client hydration
 */

export function formatTimeSafe(dateInput: string | number | Date | undefined): string {
  if (!dateInput) return '--:--';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  } catch {
    return '--:--';
  }
}

export function formatHourMinuteSafe(dateInput: string | number | Date | undefined): string {
  if (!dateInput) return '--:--';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '--:--';
  }
}

export function formatDateSafe(dateInput: string | number | Date | undefined): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}
