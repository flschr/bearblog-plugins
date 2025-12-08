const times = document.querySelectorAll('time');
const format_string = "d. M Y" || "d. M, Y"

times.forEach(time => {
    time.innerText = formatDate(time.dateTime, format_string)
});

function formatDate(dateStr, formatStr) {
    const date = new Date(dateStr);
    // UTC-Methoden verwenden statt lokaler Methoden
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    const weekday = date.getUTCDay();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    
    const monthsFull = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const monthsShort = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const daysFull = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const daysShort = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    
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
        'F': () => monthsFull[month],
        'j': () => day.toString(),
        'D': () => daysShort[weekday],
        'l': () => daysFull[weekday],
        'S': () => getOrdinal(day),
        'M': () => monthsShort[month],
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