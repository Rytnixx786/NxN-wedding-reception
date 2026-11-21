export type AttendanceStatus = 'attending' | 'declined';

export interface RsvpSubmission {
  name: string;
  phone: string;
  guests: string;
  attendance: AttendanceStatus;
  side: string;
  message: string;
  submittedAt: string;
}

export interface RsvpSaveResult {
  record: RsvpSubmission;
  mode: 'supabase' | 'local-preview';
}

const LOCAL_STORAGE_KEY = 'nxn_wedding_rsvp_v2';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const RSVP_TABLE = (import.meta.env.VITE_SUPABASE_RSVP_TABLE as string | undefined) || 'rsvps';

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function loadLocalRsvp(): RsvpSubmission | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RsvpSubmission) : null;
  } catch {
    return null;
  }
}

function persistLocalRsvp(record: RsvpSubmission): void {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage quota or private mode fallback
  }
}

export async function submitRsvp(
  payload: Omit<RsvpSubmission, 'submittedAt'>
): Promise<RsvpSaveResult> {
  const record: RsvpSubmission = {
    ...payload,
    submittedAt: new Date().toISOString(),
  };

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${RSVP_TABLE}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        guest_name: record.name,
        phone: record.phone || null,
        guest_count: record.guests,
        attendance: record.attendance,
        guest_side: record.side,
        message: record.message || null,
        created_at: record.submittedAt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Could not save your RSVP right now (HTTP ${response.status}). Please try again.`);
    }

    persistLocalRsvp(record);
    return { record, mode: 'supabase' };
  }

  // Clearly identified local browser fallback when backend env vars are not set
  persistLocalRsvp(record);
  return { record, mode: 'local-preview' };
}
