export function getProfileDir(): string {
  return process.env.ARFAK_PROFILE ?? process.cwd();
}
