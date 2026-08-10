// Pre-launch password gate. Active only while the SITE_PASSWORD env var is
// set — delete the var (and redeploy) to open the site at launch. The cookie
// stores a hash of the password, never the password itself, so changing the
// password invalidates existing sessions.

export const GATE_COOKIE = 'ts_gate'

export async function gateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`tourist-gate:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
