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

        // Sort recent months (newest first) using the stored date objects
        const sortedMonths = Array.from(recentPostsByMonth.entries())
            .sort((a, b) => b[1].date - a[1].date)
            .map(entry => entry[0]);

        // Sort old years (newest first)
        const sortedYears = Array.from(oldPostsByYear.keys()).sort((a, b) => {
            return parseInt(b) - parseInt(a);
        });

        // Group adjacent years with < 3 posts
        const groupedYears = [];
        let i = 0;

        while (i < sortedYears.length) {
            const currentYear = sortedYears[i];
            const currentData = oldPostsByYear.get(currentYear);

            // If current year has >= 3 posts, keep it separate
            if (currentData.posts.length >= 3) {
                groupedYears.push({
                    years: [currentYear],
                    posts: currentData.posts
                });
                i++;
            } else {
                // Start a group with the current year
                const group = {
                    years: [currentYear],
                    posts: [...currentData.posts]
                };

                let j = i + 1;
                // Add consecutive years with < 3 posts until we have >= 3 total posts
                while (j < sortedYears.length && group.posts.length < 3) {
                    const nextYear = sortedYears[j];
                    const nextData = oldPostsByYear.get(nextYear);

                    // Only add if next year also has < 3 posts
                    if (nextData.posts.length < 3) {
                        group.years.push(nextYear);
                        group.posts.push(...nextData.posts);
                        j++;
                    } else {
                        break;
                    }
                }

                groupedYears.push(group);
                i = j;
            }
        }

        // Render the structure
        blogPostsList.innerHTML = '';

        // Render recent posts by month
        sortedMonths.forEach(monthYear => {
            const header = document.createElement('strong');
            header.textContent = monthYear;
            header.className = 'month-header';
            header.style.display = 'block';
            blogPostsList.appendChild(header);

            // Sort posts within this month (newest first)
            const monthPosts = recentPostsByMonth.get(monthYear).posts.sort((a, b) => {
                const dateA = new Date(a.querySelector('time').getAttribute('datetime'));
                const dateB = new Date(b.querySelector('time').getAttribute('datetime'));
                return dateB - dateA;
            });

            monthPosts.forEach(post => {
                blogPostsList.appendChild(post);
            });
        });

        // Render old posts by year (with grouping)
        groupedYears.forEach(group => {
            const header = document.createElement('strong');

            // Format header based on number of years in group
            if (group.years.length === 1) {
                header.textContent = group.years[0];
            } else {
                // Multiple years: format as "2009 - 2011"
                const oldestYear = group.years[group.years.length - 1];
                const newestYear = group.years[0];
                header.textContent = `${oldestYear} - ${newestYear}`;
            }

            header.className = 'month-header';
            header.style.display = 'block';
            blogPostsList.appendChild(header);

            // Sort posts within this group (newest first)
            const sortedGroupPosts = group.posts.sort((a, b) => {
                const dateA = new Date(a.querySelector('time').getAttribute('datetime'));
                const dateB = new Date(b.querySelector('time').getAttribute('datetime'));
                return dateB - dateA;
            });

            // Add all posts in this group
            sortedGroupPosts.forEach(post => {
                blogPostsList.appendChild(post);
            });
        });
    }

    // Run the organization when the DOM is loaded
    if (document.querySelector(".blog-posts")) {
        document.addEventListener('DOMContentLoaded', organizeBlogPosts);
    }
})();