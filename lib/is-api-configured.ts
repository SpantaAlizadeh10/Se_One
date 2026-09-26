/** True when the Next app is pointed at a .NET API (see .env.local). */
export function isApiConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);
}
