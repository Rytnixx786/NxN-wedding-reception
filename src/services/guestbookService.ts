export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

const STORAGE_KEY = 'nxn_wedding_guestbook_v1';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const GUESTBOOK_TABLE =
  (import.meta.env.VITE_SUPABASE_GUESTBOOK_TABLE as string | undefined) || 'guestbook';

export function isGuestbookBackendConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function fetchGuestbookEntries(): Promise<{
  entries: GuestbookEntry[];
  mode: 'supabase' | 'local-preview';
}> {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${GUESTBOOK_TABLE}?select=id,guest_name,message,created_at&order=created_at.desc&limit=50`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (response.ok) {
      const rows = (await response.json()) as Array<{
        id: string;
        guest_name: string;
        message: string;
        created_at: string;
      }>;
      return {
        mode: 'supabase',
        entries: rows.map((r) => ({
          id: String(r.id),
          name: r.guest_name,
          message: r.message,
          createdAt: r.created_at,
        })),
      };
    }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return {
      mode: 'local-preview',
      entries: raw ? (JSON.parse(raw) as GuestbookEntry[]) : [],
    };
  } catch {
    return { mode: 'local-preview', entries: [] };
  }
}

export async function addGuestbookEntry(
  name: string,
  message: string
): Promise<{ entry: GuestbookEntry; mode: 'supabase' | 'local-preview' }> {
  const entry: GuestbookEntry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    message,
    createdAt: new Date().toISOString(),
  };

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${GUESTBOOK_TABLE}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        guest_name: entry.name,
        message: entry.message,
        created_at: entry.createdAt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Unable to post wish (HTTP ${response.status}).`);
    }
    return { entry, mode: 'supabase' };
  }

  const existing = (await fetchGuestbookEntries()).entries;
  const updated = [entry, ...existing];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
  return { entry, mode: 'local-preview' };
}
