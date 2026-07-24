// lib/crmClient.js
// Thin fetch wrapper for calling service-box-35.ru's external v1 API from server
// code (chat proxy, booking forwarding). Retries a few times — service-box-35.ru's
// DNS zone has had an intermittent stray bad A record causing occasional
// connection failures; retrying re-resolves DNS and usually lands on the
// working address. Returns null if CRM env vars aren't configured (caller
// decides how to handle "CRM not configured" vs a real network failure).
export async function fetchCrm(path, options = {}, attempts = 4) {
  const crmApiUrl = process.env.CRM_API_URL;
  const crmApiKey = process.env.CRM_API_KEY;
  if (!crmApiUrl || !crmApiKey) return null;

  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(`${crmApiUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${crmApiKey}`,
          ...(options.headers || {}),
        },
      });
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 150));
    }
  }
  throw lastErr;
}
