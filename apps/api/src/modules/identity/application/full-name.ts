export const normalizeFullName = (input: string): string => {
  const name = input.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 100 || !/^[\p{L}\p{M} .'’-]+$/u.test(name))
    throw new Error('Full name must be 2–100 valid characters');
  return name;
};
