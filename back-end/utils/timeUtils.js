// Utility to normalize various time inputs to SQL-compatible 'HH:mm:ss' strings
function normalizeTime(time) {
  if (!time && time !== 0) return null;

  // Date object -> HH:mm:ss
  // Use UTC getters to extract the time portion so we don't get impacted by the process local timezone
  if (time instanceof Date) {
    const hh = String(time.getUTCHours()).padStart(2, '0');
    const mm = String(time.getUTCMinutes()).padStart(2, '0');
    const ss = String(time.getUTCSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  // If it's a number (seconds or milliseconds) try to create Date
  if (typeof time === 'number') {
    const dt = new Date(time);
    if (!isNaN(dt)) return dt.toTimeString().split(' ')[0];
  }

  // String parsing
  if (typeof time === 'string') {
    const t = time.trim();


      // If string already in 'HH:mm' or 'HH:mm:ss' form, handle directly (avoid Date.parse)
      if (/^\d{1,2}:\d{2}$/.test(t)) {
        // 'H:mm' or 'HH:mm' -> normalize to 'HH:mm:00'
        const parts = t.split(':').map(Number);
        const hh = String(parts[0]).padStart(2, '0');
        const mm = String(parts[1]).padStart(2, '0');
        return `${hh}:${mm}:00`;
      }

      if (/^\d{1,2}:\d{2}:\d{2}$/.test(t)) {
        const parts = t.split(':').map(Number);
        const hh = String(parts[0]).padStart(2, '0');
        const mm = String(parts[1]).padStart(2, '0');
        const ss = String(parts[2]).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      }

      // For ISO / full datetime strings, parse and use UTC getters to avoid local timezone shift
      const parsed = Date.parse(t);
      if (!isNaN(parsed)) {
        const dt = new Date(parsed);
        const hh = String(dt.getUTCHours()).padStart(2, '0');
        const mm = String(dt.getUTCMinutes()).padStart(2, '0');
        const ss = String(dt.getUTCSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
      }

    // 'H:mm' -> '0H:mm:00'
    if (/^\d{1}:\d{2}$/.test(t)) return '0' + t + ':00';

    // 'HH:mm:ss' keep
    if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
  }

  throw new Error(`Invalid time format: ${time}`);
}

function minutesToHHMM(totalMinutes) {
  const m = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}
function formatSqlTime(sqlTime) {
  if (!sqlTime) return null;

  if (typeof sqlTime === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(sqlTime)) {
    return sqlTime.slice(0, 5);
  }

  const date = new Date(sqlTime);
  if (isNaN(date.getTime())) return null;

  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function formatDateToYMDUTC(date) {
  const d = (date instanceof Date) ? date : new Date(date);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy}`;
}
function minutesToHHMMSS(totalMinutes) {
  // wrap trong 0-1439 phút (0:00 -> 23:59)
  const m = ((totalMinutes % (24*60)) + (24*60)) % (24*60);
  const hh = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00`;
}

module.exports = { normalizeTime, minutesToHHMM, timeToMinutes ,formatSqlTime, formatDateToYMDUTC, minutesToHHMMSS};
