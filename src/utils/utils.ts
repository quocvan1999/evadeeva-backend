import * as crypto from 'crypto';

export const generateCode = (): number => {
  return crypto.randomInt(100000, 999999);
};

export const getFutureTime = (minutes: number): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
};

export const isDateValid = (dateString: Date): boolean => {
  const inputDate = new Date(dateString);
  const today = new Date();
  return inputDate >= today;
};
