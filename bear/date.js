(function() {
  'use strict';

  // Constants for German date/time names
  const MONTHS_FULL = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  const DAYS_FULL = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const DAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const ORDINALS = ['th', 'st', 'nd', 'rd'];

  // Configuration
  const FORMAT_STRING = 'd. M Y';

  function getOrdinal(n) {
    const v = n % 100;
    return ORDINALS[(v - 20) % 10] || ORDINALS[v] || ORDINALS[0];
  }

  function formatDate(dateStr, formatStr) {
    const date = new Date(dateStr);
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const weekday = date.getUTCDay();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    const formatters = {
      'd': () => day.toString().padStart(2, '0'),
      'j': () => day.toString(),
      'S': () => getOrdinal(day),
      'm': () => (month + 1).toString().padStart(2, '0'),
      'M': () => MONTHS_SHORT[month],
      'F': () => MONTHS_FULL[month],
      'Y': () => year.toString(),
      'y': () => year.toString().slice(-2),
      'D': () => DAYS_SHORT[weekday],
      'l': () => DAYS_FULL[weekday],
      'H': () => hours.toString().padStart(2, '0'),
      'h': () => ((hours % 12) || 12).toString().padStart(2, '0'),
      'g': () => ((hours % 12) || 12).toString(),
      'i': () => minutes.toString().padStart(2, '0'),
      'a': () => hours < 12 ? 'am' : 'pm',
      'A': () => hours < 12 ? 'AM' : 'PM'
    };

    let result = '';
    for (const char of formatStr) {
      result += formatters[char] ? formatters[char]() : char;
    }
    return result;
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('time').forEach(time => {
      time.textContent = formatDate(time.getAttribute('datetime'), FORMAT_STRING);
    });
  });
})();