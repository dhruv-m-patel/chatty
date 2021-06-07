export function optionalHestiaUserIdValidator(v: string | null): boolean {
  if (!v) return true;
  return /([\w\d\-_]+):hestia\/users/.test(v);
}

export function optionalAlcumusPlatformIdValidator(v: string | null): boolean {
  if (!v) return true;
  return /([\w\d\-_]+):([\w\d\s\-_]+)\/([\w\d\s\-_]+)/.test(v);
}
