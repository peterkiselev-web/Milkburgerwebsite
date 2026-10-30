// Works out whether the restaurant is open right now, in London time,
// whatever timezone the visitor's device is set to.

const DAY_MS = 24 * 60 * 60 * 1000;

function londonParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
    hourCycle: 'h23',
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    weekday: p.weekday,
    minutes: Number(p.hour) * 60 + Number(p.minute),
  };
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const formatTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  const hour = ((h + 11) % 12) + 1;
  const mins = m ? `:${String(m).padStart(2, '0')}` : '';
  return `${hour}${mins}${h < 12 ? 'am' : 'pm'}`;
};

// An override for a specific date (Christmas, a private event) beats the weekly hours.
function hoursOn(date, hours) {
  const override = hours.overrides.find((o) => o.date === date);
  if (!override) return { ...hours.weekly };
  if (override.closed) return { closed: true, note: override.note };
  return { open: override.open, close: override.close, note: override.note };
}

export function getStatus(hours, now = new Date()) {
  const today = londonParts(now, hours.timezone);
  const h = hoursOn(today.date, hours);

  if (!h.closed) {
    const open = toMinutes(h.open);
    const close = toMinutes(h.close);
    if (today.minutes >= open && today.minutes < close) {
      const closingSoon = close - today.minutes <= 45;
      return {
        open: true,
        closingSoon,
        label: closingSoon ? `Closing soon, open until ${formatTime(h.close)}` : `Open now until ${formatTime(h.close)}`,
      };
    }
    if (today.minutes < open) {
      return { open: false, label: `Opens today at ${formatTime(h.open)}` };
    }
  }

  for (let i = 1; i <= 14; i++) {
    const day = londonParts(new Date(now.getTime() + i * DAY_MS), hours.timezone);
    const next = hoursOn(day.date, hours);
    if (!next.closed) {
      const when = i === 1 ? 'tomorrow' : day.weekday;
      const prefix = h.closed && h.note ? `Closed today (${h.note}). ` : 'Closed now. ';
      return { open: false, label: `${prefix}Opens ${when} at ${formatTime(next.open)}` };
    }
  }
  return { open: false, label: 'Closed' };
}

// Fills every [data-open-status] element on the page and keeps it current.
export function mountStatus(hours, root = document) {
  const update = () => {
    const status = getStatus(hours);
    root.querySelectorAll('[data-open-status]').forEach((el) => {
      el.dataset.state = status.open ? (status.closingSoon ? 'closing' : 'open') : 'closed';
      const label = el.querySelector('[data-open-label]');
      if (label) label.textContent = status.label;
    });
  };
  update();
  setInterval(update, 60 * 1000);
}
