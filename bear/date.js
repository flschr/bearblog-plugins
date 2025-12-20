// Constants to avoid re-allocation on every formatDate call
const MONTHS_FULL = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const DAYS_FULL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const DAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

document.addEventListener('DOMContentLoaded', () => {
  // Konfiguration für das Datumsformat
  const format_string = "d. M Y";

  document.querySelectorAll('time').forEach(time => {
    time.innerText = formatDate(time.getAttribute('datetime'), format_string);
  });
});

function formatDate(dateStr, formatStr) {
    const date = new Date(dateStr);
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const weekday = date.getUTCDay();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    
    function getOrdinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }
    
    const map = {
        'd': () => day.toString().padStart(2, '0'),
        'm': () => (month + 1).toString().padStart(2, '0'),
        'Y': () => year.toString(),
        'y': () => year.toString().slice(-2),
        'F': () => MONTHS_FULL[month],
        'j': () => day.toString(),
        'D': () => DAYS_SHORT[weekday],
        'l': () => DAYS_FULL[weekday],
        'S': () => getOrdinal(day),
        'M': () => MONTHS_SHORT[month],
        'H': () => hours.toString().padStart(2, '0'),
        'h': () => {
            let h = hours % 12;
            h = h === 0 ? 12 : h;
            return h.toString().padStart(2, '0');
        },
        'g': () => {
            let h = hours % 12;
            return h === 0 ? '12' : h.toString();
        },
        'i': () => minutes.toString().padStart(2, '0'),
        'a': () => hours < 12 ? 'am' : 'pm',
        'A': () => hours < 12 ? 'AM' : 'PM',
    };
    
    let result = '';
    for (let char of formatStr) {
        result += map[char] ? map[char]() : char;
    }
    return result;
}