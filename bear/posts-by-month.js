(function() {
    // Nur auf /blog/ ausführen
    if (window.location.pathname !== '/blog/') {
        return;
    }

    // Posts from this year onwards will be grouped by month, older posts by year
    const YEAR_GROUPING_THRESHOLD = 2020;

    // Function to format the month and year for headers
    function formatMonthYear(date) {
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    // Function to get year only
    function getYear(date) {
        return date.getFullYear();
    }

    // Function to organize blog posts by month or year
    function organizeBlogPosts() {
        const blogPostsList = document.querySelector('.blog-posts');
        if (!blogPostsList) return;

        const posts = Array.from(blogPostsList.querySelectorAll('li'));
        const recentPostsByMonth = new Map(); // Posts >= threshold year
        const oldPostsByYear = new Map();     // Posts < threshold year

        // Group posts by month (recent) or year (old)
        posts.forEach(post => {
            const timeElement = post.querySelector('time');
            if (!timeElement) return;

            const date = new Date(timeElement.getAttribute('datetime'));
            const year = getYear(date);

            if (year >= YEAR_GROUPING_THRESHOLD) {
                // Recent posts: group by month
                const monthYear = formatMonthYear(date);
                if (!recentPostsByMonth.has(monthYear)) {
                    recentPostsByMonth.set(monthYear, {
                        posts: [],
                        date: date
                    });
                }
                recentPostsByMonth.get(monthYear).posts.push(post);
            } else {
                // Old posts: group by year
                const yearStr = year.toString();
                if (!oldPostsByYear.has(yearStr)) {
                    oldPostsByYear.set(yearStr, {
                        posts: [],
                        year: year
                    });
                }
                oldPostsByYear.get(yearStr).posts.push(post);
            }
        });

        // Sort recent months (newest first)
        const sortedMonths = Array.from(recentPostsByMonth.keys()).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateB - dateA;
        });

        // Sort old years (newest first)
        const sortedYears = Array.from(oldPostsByYear.keys()).sort((a, b) => {
            return parseInt(b) - parseInt(a);
        });

        // Render the structure
        blogPostsList.innerHTML = '';

        // Render recent posts by month
        sortedMonths.forEach(monthYear => {
            const header = document.createElement('strong');
            header.textContent = monthYear;
            header.className = 'month-header';
            header.style.display = 'block';
            blogPostsList.appendChild(header);

            recentPostsByMonth.get(monthYear).posts.forEach(post => {
                blogPostsList.appendChild(post);
            });
        });

        // Render old posts by year
        sortedYears.forEach(year => {
            const header = document.createElement('strong');
            header.textContent = year;
            header.className = 'month-header';
            header.style.display = 'block';
            blogPostsList.appendChild(header);

            oldPostsByYear.get(year).posts.forEach(post => {
                blogPostsList.appendChild(post);
            });
        });
    }

    // Run the organization when the DOM is loaded
    if (document.querySelector(".blog-posts")) {
        document.addEventListener('DOMContentLoaded', organizeBlogPosts);
    }
})();