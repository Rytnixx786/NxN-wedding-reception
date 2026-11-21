import { weddingConfig } from '../config/wedding';

function toUtcCompact(isoDate: string): string {
  const date = new Date(isoDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}` +
    `${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}T` +
    `${pad(date.getUTCHours())}` +
    `${pad(date.getUTCMinutes())}` +
    `${pad(date.getUTCSeconds())}Z`
  );
}

export function buildGoogleCalendarUrl(): string {
  const { reception, venue } = weddingConfig;
  const startUtc = toUtcCompact(reception.dateIsoStart);
  const endUtc = toUtcCompact(reception.dateIsoEnd);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: reception.calendarEventTitle,
    dates: `${startUtc}/${endUtc}`,
    location: venue.fullAddress,
    details: `${reception.calendarEventDescription}\n\nGoogle Maps: ${venue.mapsShareUrl}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildOutlookCalendarUrl(): string {
  const { reception, venue } = weddingConfig;
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: reception.calendarEventTitle,
    startdt: reception.dateIsoStart,
    enddt: reception.dateIsoEnd,
    location: venue.fullAddress,
    body: `${reception.calendarEventDescription}\n\nGoogle Maps: ${venue.mapsShareUrl}`,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function escapeIcsText(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function downloadIcsFile(): void {
  const { reception, venue, couple } = weddingConfig;
  const startUtc = toUtcCompact(reception.dateIsoStart);
  const endUtc = toUtcCompact(reception.dateIsoEnd);
  const stampUtc = toUtcCompact(new Date().toISOString());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${couple.groomShortName} & ${couple.brideShortName} Wedding//Invitation//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${couple.groomShortName.toLowerCase()}-${couple.brideShortName.toLowerCase()}-${reception.calendarYear}${String(reception.calendarMonthIndex + 1).padStart(2, '0')}${String(reception.calendarHighlightDay).padStart(2, '0')}@wedding-invite`,
    `DTSTAMP:${stampUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcsText(reception.calendarEventTitle)}`,
    `LOCATION:${escapeIcsText(venue.fullAddress)}`,
    `DESCRIPTION:${escapeIcsText(`${reception.calendarEventDescription}\nMaps: ${venue.mapsShareUrl}`)}`,
    `GEO:${venue.latitude};${venue.longitude}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${couple.groomShortName}-and-${couple.brideShortName}-Wedding-Reception.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
