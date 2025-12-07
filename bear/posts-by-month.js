(function() {
    'use strict';

    // Nur auf /blog/ ausführen
    if (window.location.pathname !== '/blog/') {
        return;
    }

    /**
     * Posts ab diesem Jahr werden nach Monat gruppiert,
     * ältere Posts werden nach Jahr gruppiert.
     * Anpassen falls gewünscht (z.B. aktuelles Jahr - 5)
     */
    const YEAR_GROUPING_THRESHOLD = 2020;

    // Function to format the month and year for headers
    function formatMonthYear(date) {
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    // Function to get year only
    function getYear(date) {
        return date.getFullYear();
    }

    /**
     * Organisiert Blog-Posts nach Monat (neuere Posts) oder Jahr (ältere Posts)
     */
    function organizeBlogPosts() {
        const blogPostsList = document.querySelector('.blog-posts');
        if (!blogPostsList) {
            console.warn('Blog posts list not found');
            return;
        }

        const posts = Array.from(blogPostsList.querySelectorAll('li'));
        if (posts.length === 0) {
            console.warn('No blog posts found');
            return;
        }

        const recentPostsByMonth = new Map(); // Posts >= threshold year
        const oldPostsByYear = new Map();     // Posts < threshold year

        // Group posts by month (recent) or year (old)
        posts.forEach(post => {
            const timeElement = post.querySelector('time');
            if (!timeElement) {
                console.warn('Post without time element found', post);
                return;
            }

            const datetime = timeElement.getAttribute('datetime');
            if (!datetime) {
                console.warn('Time element without datetime attribute', timeElement);
                return;
            }

            try {
                const date = new Date(datetime);
                if (isNaN(date.getTime())) {
                    console.warn('Invalid date:', datetime);
                    return;
                }

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
            } catch (error) {
                console.error('Error processing post date:', error, post);
            }
        });

        // Helper function to sort posts by date (newest first)
        function sortPostsByDate(posts) {
            return posts.sort((a, b) => {
                const dateA = new Date(a.querySelector('time').getAttribute('datetime'));
                const dateB = new Date(b.querySelector('time').getAttribute('datetime'));
                return dateB - dateA;
            });
        }

        // Sort posts within each month group
        recentPostsByMonth.forEach(monthData => {
            monthData.posts = sortPostsByDate(monthData.posts);
        });

        // Sort posts within each year group
        oldPostsByYear.forEach(yearData => {
            yearData.posts = sortPostsByDate(yearData.posts);
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

            // Posts are already sorted
            const monthPosts = recentPostsByMonth.get(monthYear).posts;
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

            // Posts are already sorted - just need to re-sort the combined group
            const sortedGroupPosts = sortPostsByDate(group.posts);

            // Add all posts in this group
            sortedGroupPosts.forEach(post => {
                blogPostsList.appendChild(post);
            });
        });
    }

    // Run the organization when the DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', organizeBlogPosts);
    } else {
        // DOM already loaded
        organizeBlogPosts();
    }
})();